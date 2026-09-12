import csv
import importlib.util
import io
import json
import subprocess
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('import_goatcounter_daily',ROOT/'scripts_admin/import_goatcounter_daily.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def data(rows):
    stream=io.StringIO();writer=csv.writer(stream)
    writer.writerow(['2Path','Event','Session','Bot','Date'])
    writer.writerows(rows)
    return stream.getvalue().encode()


class CrewDailyMetricsTests(unittest.TestCase):
    def test_daily_unique_is_deduplicated_across_pages_and_date_uses_fortaleza(self):
        raw=data([
          ['/aldenirmed89/','false','s1','0','2026-09-12T01:00:00Z'],
          ['/aldenirmed89/index.html','false','s1','0','2026-09-12T01:01:00Z'],
          ['/aldenirmed89/radar/','false','s1','0','2026-09-12T01:02:00Z'],
          ['/aldenirmed89/radar/','false','s2','0','2026-09-12T01:03:00Z'],
          ['/aldenirmed89/','false','s1','0','2026-09-12T04:00:00Z'],
          ['/aldenirmed89/','false','robot','1','2026-09-12T04:00:00Z'],
          ['/event','true','s1','0','2026-09-12T04:00:00Z'],
          ['/outside/private','false','s1','0','2026-09-12T04:00:00Z']])
        result=module.aggregate(raw,module.route_allowlist({'radar':'radar/index.html'}))
        self.assertEqual([(d['date'],d['visitors'],d['views']) for d in result['days']],[('2026-09-11',2,4),('2026-09-12',1,1)])
        self.assertEqual(result['source']['excludedRows'],3)
        output=json.dumps(result)
        for private in ('s1','s2','robot','Session','outside/private'):
            self.assertNotIn(private,output)

    def test_missing_session_is_not_zero_and_no_empty_day_is_invented(self):
        result=module.aggregate(data([['/aldenirmed89/','false','','0','2026-09-10T12:00:00Z'],['/aldenirmed89/','false','s','0','2026-09-12T12:00:00Z']]),module.route_allowlist({}))
        self.assertIsNone(result['days'][0]['visitors'])
        self.assertEqual([d['date'] for d in result['days']],['2026-09-10','2026-09-12'])

    def test_csv_rejects_unversioned_malformed_and_naive_date(self):
        for raw in (b'Path,Session\n/,foo',b'2Path,Event,Session,Bot,Date\n/,false,s,0',data([['/aldenirmed89/','false','s','0','2026-09-12T12:00:00']])):
            with self.assertRaises(ValueError):module.aggregate(raw,module.route_allowlist({}))

    def test_browser_validates_reconciles_and_filters_without_summing_unique_pages(self):
        result=module.aggregate(data([['/aldenirmed89/','false','s','0','2026-09-10T12:00:00Z'],['/aldenirmed89/','false','s','0','2026-09-12T12:00:00Z']]),module.route_allowlist({}))
        js=r'''
const assert=require('node:assert/strict');
const core=require('./18_Centro_Tripulacao/assets/daily-metrics-core.js');
const report=core.validate(JSON.parse(process.argv[1]));
assert.equal(core.select(report,'2026-09-12','2026-09-12').views,1);
assert.equal(core.select(report,'2026-09-12','2026-09-12').visitorDays,1);
assert.equal(core.select(report,'','').views,2);
assert.equal(core.select(report,'','').visitorDays,2); // visitor-days, never period unique
assert.equal(core.select(report,'2026-09-11','2026-09-11').views,null);
assert.equal(core.validDay('2026-02-30'),false);assert.equal(core.validDay('2026-99-10'),false);
const overflow=structuredClone(report);overflow.days.forEach(d=>{d.views=Number.MAX_SAFE_INTEGER;d.pages[0].views=Number.MAX_SAFE_INTEGER;});assert.throws(()=>core.validate(overflow));
const bad=structuredClone(report);bad.days[0].views=999;assert.throws(()=>core.validate(bad));
const pii=structuredClone(report);pii.days[0].email='private@example.com';assert.throws(()=>core.validate(pii));
const path=structuredClone(report);path.days[0].pages[0].path='/aldenirmed89/%2e%2e/secret';assert.throws(()=>core.validate(path));
const missing=structuredClone(report);missing.days[0].visitors=null;assert.equal(core.select(core.validate(missing),'','').visitorDays,null);
const empty=core.validate(require('./18_Centro_Tripulacao/data/daily-visits.json'));assert.equal(core.select(empty,'','').views,null);
'''
        outcome=subprocess.run(['node','-e',js,json.dumps(result)],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(outcome.returncode,0,outcome.stderr)

    def test_javascript_syntax(self):
        for path in ['daily-metrics-core.js','daily-metrics.js','share.js']:
            result=subprocess.run(['node','--check',str(ROOT/'18_Centro_Tripulacao/assets'/path)],capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr)

if __name__=='__main__':unittest.main()
