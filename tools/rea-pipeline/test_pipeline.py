import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from capture import Recorder, validate
from pipeline import connect, masked_code, query, DEFAULT_DB


class PipelineTests(unittest.TestCase):
    def test_literal_braces_keep_line_locations(self):
        source = 'class UIA {\n string s = "}"; // {\n /* } */ void F() {} \n}'
        masked = masked_code(source)
        self.assertEqual(source.count('\n'), masked.count('\n'))
        self.assertEqual(masked.count('{'), 2)
        self.assertEqual(masked.count('}'), 2)

    def test_source_lookup(self):
        with connect(DEFAULT_DB) as db:
            result = query(db, 'UISelectEquip')
            self.assertTrue(result['windows'])
            self.assertTrue(any(w['edges'] for w in result['windows']))
            for w in result['windows']:
                self.assertGreater(w['line'], 0)
                self.assertTrue(all(e['confidence'] == 'static-reference' for e in w['edges']))

    def test_capture_rejects_invalid_actions(self):
        for step in [{'action':'shell'}, {'action':'tap','x':1,'y':.5},
                     {'action':'wait','seconds':61}]:
            with self.assertRaises(ValueError):
                validate({'steps':[step]})

    def test_capture_requires_foreground_guard(self):
        with self.assertRaises(ValueError):
            Recorder().capture({'steps':[{'action':'back'}]}, Path('unused'))

    def test_failure_retains_manifest_and_run(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder, db = Path(tmp)/'failed', Path(tmp)/'index.sqlite'
            recorder = Recorder(package='example.game')
            with patch.object(recorder, 'run', return_value='versionName=test'), patch.object(recorder, 'checkpoint', side_effect=RuntimeError('foreground changed')):
                with self.assertRaises(RuntimeError):
                    recorder.capture({'steps':[{'action':'snapshot'}]}, folder, db)
            manifest = json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
            self.assertEqual(manifest['status'], 'failed')
            self.assertEqual(len(manifest['steps']), 1)
            with connect(db) as conn:
                self.assertEqual(conn.execute('SELECT status FROM runs').fetchone()[0], 'failed')


if __name__ == '__main__':
    unittest.main()
