# Çimko Ekran Yönetimi

Fabrika / yemekhane / antre / resepsiyon TV'lerine video ve görsel yayınlamak için
cihaz, şube, grup, senaryo (oynatma listesi), kural ve yemek menüsü yönetim paneli.

Gerçek bir **SQLite veritabanı** (backend) ve dosya depolama (`backend/uploads`)
kullanır; artık büyük video dosyaları da doğrudan yüklenebilir.

## Mimari

```
cimko-tv-yonetim/
├── backend/         Express API + SQLite (better-sqlite3)
│   ├── db.js         veritabanı şeması
│   ├── server.js      sunucu giriş noktası
│   ├── routes/        /api/* uç noktaları
│   ├── data/          signage.db burada oluşur (git'e girmez)
│   └── uploads/       yüklenen görsel/video dosyaları (git'e girmez)
└── frontend/        React + Vite + Tailwind arayüz
    └── src/
        ├── api.js       backend istemcisi
        ├── App.jsx       navigasyon ve veri yükleme
        ├── components/   paylaşılan arayüz parçaları
        └── views/        Cihazlar, Şubeler, Gruplar, Kurallar, Medyalar,
                           Senaryolar, Yemek Menüleri, TV Önizleme
```

## Veri modeli (özet)

| Varlık | Açıklama |
|---|---|
| **branches** | Şube/lokasyon (ad, kod, konum, durum) |
| **groups_tbl** | Cihaz grupları |
| **devices** | Ekranlar — şube, grup, senaryo ve durum ataması |
| **media** | Görsel (yüklenen dosya) veya video (yüklenen dosya ya da URL) |
| **scenarios** + **scenario_items** | Oynatma listeleri — sıralı medya + tarih aralığı |
| **rules** + **rule_devices** | Haftalık gün/saat kuralları ve uygulandığı cihazlar |
| **food_menus** | Günlük yemek menüsü (tarih, etiket, yemek + kalori) |

## Yerel geliştirme

```bash
npm run install:all   # backend + frontend bağımlılıklarını kurar
npm run dev           # backend (4000) ve frontend (5173) aynı anda başlar
```

Ardından tarayıcıda `http://localhost:5173` adresini açın. Frontend, `/api` ve
`/uploads` isteklerini Vite proxy üzerinden otomatik olarak backend'e (4000) yönlendirir.

## GitHub'a yükleme ve Codespaces ile geliştirme

1. Bu klasörü kendi GitHub deponuza yükleyin:
   ```bash
   git init
   git add .
   git commit -m "İlk sürüm: Çimko ekran yönetimi"
   git branch -M main
   git remote add origin https://github.com/<kullanici-adiniz>/<repo-adi>.git
   git push -u origin main
   ```
2. GitHub'da reponuzu açın → **Code** → **Codespaces** sekmesi → **Create codespace on main**.
3. Codespace açıldığında `.devcontainer/devcontainer.json` sayesinde Node.js kurulur ve
   `npm install` otomatik çalışır (birkaç dakika sürebilir).
4. Terminalde çalıştırın:
   ```bash
   npm run dev
   ```
5. VS Code sağ altta **Ports** bildirimiyle 5173 portunu tarayıcıda açmanızı önerecek —
   ya da **Ports** sekmesinden 5173'ü açın.

Codespace'te yaptığınız her değişiklik anında `--watch` (backend) ve Vite HMR (frontend)
ile yeniden yüklenir; commit edip push ettiğinizde reponuzda kalıcı olur.

## Notlar / sınırlamalar

- Veritabanı dosyası (`backend/data/signage.db`) ve yüklenen medya (`backend/uploads/`)
  `.gitignore` ile hariç tutulmuştur — yani gerçek içerikleriniz GitHub'a değil, çalıştığınız
  ortamda (Codespace/sunucu) diskte durur. Kalıcı bir sunucuya taşırken bu klasörleri
  yedeklemeyi (ya da bir cloud storage'a taşımayı) unutmayın.
- Üretime almadan önce: kimlik doğrulama (login) eklenmesi, `multer` dosya boyutu/tipi
  sınırlarının netleştirilmesi ve HTTPS arkasında bir reverse proxy (nginx vb.) önerilir.
- Kapsam dışı bırakılanlar: API Teknoloji'deki tam kanvas tasarım editörü (arkaplan
  üzerine hava durumu/döviz ticker'ı, saat widget'ları serbest yerleştirme). İstenirse
  ayrı bir geliştirme turunda eklenebilir.
