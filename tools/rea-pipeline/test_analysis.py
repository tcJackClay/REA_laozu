"""Regression checks against independently known original source relationships."""
import json
import unittest
from analyze import DEFAULT_OUT
from pipeline import ROOT


class AnalysisTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report=json.loads((DEFAULT_OUT/'report.json').read_text(encoding='utf-8'))

    def window(self,name):
        found=[w for w in self.report['windows'] if w['name']==name]
        self.assertEqual(len(found),1)
        return found[0]

    def test_open_bag_reaches_disciple_info(self):
        w=self.window('UISelectEquip')
        b=next(b for b in w['buttons'] if b['field']=='btn_OpenBag')
        self.assertEqual(b['callback'],'OnBtn_OpenBagClicked')
        self.assertIn('UIDiscipleInfo',[e['target'] for e in b['trace']['edges']])

    def test_confirm_serialized_slot(self):
        w=self.window('UIBuyGridConfirm')
        b=next(b for b in w['buttons'] if b['field']=='btn_Confirm')
        self.assertEqual(b['slot'],0)
        self.assertIsNotNone(b['path'])
        self.assertEqual(w['bindings'][b['path']]['action'],'UIBuyGridConfirm.OnBtn_ConfirmClicked')
        self.assertTrue(b['trace']['conditions'])

    def test_report_has_all_indexed_classes_and_source_lines(self):
        self.assertEqual(len(self.report['windows']),self.report['counts']['windows'])
        for w in self.report['windows']:
            self.assertTrue((ROOT/w['source']).exists())
            for b in w['buttons']:
                self.assertGreaterEqual(b['registrationLine'],w['line'])
                self.assertLessEqual(b['registrationLine'],w['end_line'])


if __name__=='__main__':
    unittest.main()
