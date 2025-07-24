// File: src/AIChecker.js (Versi yang sudah diupdate)

import React, { useState } from 'react';

// --- Komponen Ikon untuk Loading ---
const IconLoader = () => (
  <svg className="spinner" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
  </svg>
);

// --- Komponen Utama AI Checker ---
export default function AIChecker() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState(null);

  // Fungsi untuk menangani saat pengguna memilih file gambar
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAiResponse(null); // Reset response sebelumnya
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Untuk preview di layar
        // Hapus prefix data URL untuk mendapatkan data base64 murni
        const base64String = reader.result.replace(/^data:.+;base64,/, '');
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi untuk mengirim gambar dan prompt ke AI
  const handleCheckCondition = async () => {
    if (!imageBase64) {
      setError("Pilih gambar terlebih dahulu.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    // PENTING: Ganti dengan API Key kamu sendiri dari Google AI Studio
    const apiKey = "AIzaSyAO8MAq9ET_RjiSpO4kc0lh0evPjd4mgKU"; // GANTI DENGAN API KEY-MU
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      // --- TAHAP 1: Validasi Gambar ---
      // Prompt ini bertanya ke AI apakah gambar tersebut adalah pakaian.
      const validationPrompt = `Apakah subjek utama dari gambar ini adalah item pakaian (seperti baju, celana, gaun, jaket)? Jangan analisis kondisinya. Jawab HANYA dengan satu kata: "Ya" atau "Tidak".`;

      const validationPayload = {
        contents: [{
          parts: [
            { text: validationPrompt },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
          ]
        }]
      };

      const validationResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationPayload)
      });

      if (!validationResponse.ok) {
        throw new Error(`Permintaan API validasi gagal dengan status ${validationResponse.status}`);
      }

      const validationResult = await validationResponse.json();
      const validationText = validationResult.candidates[0].content.parts[0].text.trim();

      // Jika jawaban AI bukan "Ya", tampilkan error dan hentikan proses.
      if (validationText.toLowerCase() !== 'ya') {
        setError("Gambar tidak valid. Harap unggah foto pakaian yang jelas.");
        setIsLoading(false);
        return;
      }

      // --- TAHAP 2: Jika Valid, Analisis Kondisi Pakaian ---
      // Prompt ini sama seperti sebelumnya, untuk mengecek kondisi.
      const conditionPrompt = `
        Analisis gambar pakaian ini dengan seksama.
        Tugasmu adalah:
        1. Tentukan apakah pakaian ini memenuhi kriteria "layak pakai" untuk program daur ulang. Kriteria "tidak layak" adalah jika ada kerusakan parah seperti sobekan yang sangat besar, bolong, atau noda yang sangat banyak dan mencolok.
        2. Berdasarkan analisismu, berikan status "Diterima" atau "Ditolak".
        3. Jika statusnya "Ditolak", identifikasi kategori pakaiannya (contoh: Kemeja, Kaos, Celana Jeans, Gaun).
        4. Jika statusnya "Ditolak", berikan 3 ide upcycling atau pemanfaatan kembali yang kreatif dan bermanfaat untuk kategori pakaian tersebut.
        
        Kembalikan jawabanmu HANYA dalam format JSON yang valid seperti ini, tanpa teks tambahan apa pun:
        {
          "status": "Diterima" | "Ditolak",
          "kategori": "...",
          "saran_upcycle": [
            "ide 1...",
            "ide 2...",
            "ide 3..."
          ]
        }

        Jika status "Diterima", biarkan "kategori" dan "saran_upcycle" sebagai string kosong atau array kosong.
      `;

      const conditionPayload = {
        contents: [{
          parts: [{ text: conditionPrompt }, { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }]
        }]
      };
      
      const conditionResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conditionPayload)
      });
      
      if (!conditionResponse.ok) {
        throw new Error(`Permintaan API kondisi gagal dengan status ${conditionResponse.status}`);
      }

      const result = await conditionResponse.json();
      const responseText = result.candidates[0].content.parts[0].text;
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedResponse = JSON.parse(cleanedText);
      setAiResponse(parsedResponse);

    } catch (err) {
      console.error("Error:", err);
      setError("Oops, terjadi kesalahan saat menghubungi AI. Pastikan API Key valid dan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="ai-checker-section">
      <h2>Cek Kondisi Pakaianmu dengan AI</h2>
      <p>Unggah foto pakaian bekasmu untuk diperiksa oleh sistem cerdas kami.</p>
      
      <div className="ai-checker-box">
        <div className="image-uploader">
          {image ? (
            <img src={image} alt="Preview Pakaian" className="image-preview" />
          ) : (
            <div className="upload-placeholder">
              <p>Pilih Gambar</p>
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="file-input"
          />
        </div>
        
        <button 
          onClick={handleCheckCondition} 
          disabled={isLoading || !image}
          className="button-primary check-button"
        >
          {isLoading ? 'AI Sedang Menganalisis...' : 'Periksa Kondisi Sekarang'}
        </button>

        {isLoading && <IconLoader />}
        
        {error && <p className="error-message">{error}</p>}

        {aiResponse && (
          <div className="ai-result">
            {aiResponse.status === "Diterima" ? (
              <div className="result-accepted">
                <h3>🎉 Selamat! Pakaianmu Diterima!</h3>
                <p>Kondisi pakaianmu memenuhi kriteria untuk program daur ulang kami. Silakan lanjutkan proses pengiriman.</p>
              </div>
            ) : (
              <div className="result-rejected">
                <h3>Sayang Sekali, Pakaian Ditolak</h3>
                <p>Setelah dianalisis, pakaian ini sepertinya memiliki kerusakan yang cukup parah sehingga tidak dapat kami terima untuk program daur ulang.</p>
                <h4>Tapi jangan dibuang!</h4>
                <p>Ini adalah sebuah <strong>{aiResponse.kategori}</strong>. Kamu bisa memanfaatkannya kembali menjadi:</p>
                <ul>
                  {aiResponse.saran_upcycle.map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}