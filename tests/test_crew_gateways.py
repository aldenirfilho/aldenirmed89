import subprocess
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class CrewGatewayTests(unittest.TestCase):
    def test_gateway_auth_validation_quota_and_error_boundaries(self):
        result=subprocess.run(['node','tests/crew_gateways.test.mjs'],cwd=ROOT,capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stdout+result.stderr)
    def test_quota_migration_has_atomic_increment_and_private_grants(self):
        sql=(ROOT/'18_Centro_Tripulacao/supabase/migrations/202609120001_crew_gateway_limits.sql').read_text()
        for text in ['enable row level security','revoke all on public.crew_gateway_limits from public, anon, authenticated','on conflict(scope,subject_hash,bucket_start) do update','where public.crew_gateway_limits.hits < v_limit','from public,anon,authenticated','to service_role','search_path = public, pg_temp']:
            self.assertIn(text,sql)
        self.assertNotIn('grant select',sql)
if __name__=='__main__':unittest.main()
