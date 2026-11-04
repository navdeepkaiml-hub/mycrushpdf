# Auth Testing

Admin: admin@mycrushpdf.com / CrushPDF@2026 (role admin)

## API
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@mycrushpdf.com","password":"CrushPDF@2026"}'
curl -b cookies.txt http://localhost:8001/api/auth/me
curl -b cookies.txt http://localhost:8001/api/admin/overview

Login sets an httpOnly access_token cookie. /me and all /api/admin/* require it and role==admin.
