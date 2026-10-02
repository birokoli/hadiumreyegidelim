# Yerel test veritabanı (2 Ekim 2026, Claude)

Yerelde `.env` yok; uygulama `localhost:5432`'ye bağlanır. Artık orada **gömülü bir Postgres (PGlite)** çalışabiliyor. Sayfalar ve admin, canlıdaki herkese açık verinin bir kopyasıyla gerçek gibi denenebilir. **Canlı veritabanına hiçbir şekilde bağlanmaz.**

## Başlatma
```bash
# 1) Veritabanı sunucusu (ayrı terminal; veri scratch klasöründe kalır)
cd <pglite klasörü> && ./node_modules/.bin/pglite-server --db=./data --port=5432 --host=127.0.0.1 --max-connections=200
# 2) Şema (YALNIZCA yerel adresle)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable&pgbouncer=true" DIRECT_URL="$DATABASE_URL" npx prisma db push --skip-generate
# 3) Canlıdan herkese açık veriyi kopyala (paketler, oteller, hizmetler; yalnızca GET)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable&pgbouncer=true" npx tsx scripts/local/seed-from-live.mts
# 4) Test yöneticisi (şifre rastgele, scripts/local/.test-admin.json'a yazılır, git'e girmez)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable&pgbouncer=true" npx tsx scripts/local/seed-admin.mts
```

`pgbouncer=true` zorunlu: PGlite bütün bağlantılarda tek oturum kullanır, Prisma'nın hazır sorguları çakışır.

## Kurallar
- `prisma db push` **yalnızca** `127.0.0.1:5432` adresiyle çalıştırılır. Canlı Supabase'de asla kullanılmaz (canlı şema değişiklikleri `ensure…Schema()` ile yapılır).
- Betikler yerel adres dışında çalışmayı reddeder.
- Geliştirme sunucusu (`hadi-seo-dev`, port 3002) bu veritabanına bağlı açılır.
- Dosya değişikliğini kaçırırsa (sunucu eski kodla sayfa üretir) sunucuyu yeniden başlat.
