"use client";

import { useState } from 'react';
import { Upload, Shield, Share2, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { encryptFile, generateFileKey, exportKey } from '@/lib/crypto';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);

    try {
      const key = await generateFileKey();
      const keyStr = await exportKey(key);
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const ivBase = window.crypto.getRandomValues(new Uint8Array(12));
      const ivStr = btoa(String.fromCharCode(...ivBase));

      // 1. Init Multipart
      const initRes = await axios.post(`${API_BASE}/files/multipart/init`, {
        encryptedName: btoa(file.name),
        sizeBytes: file.size,
        wrappedDek: keyStr,
        iv: ivStr,
      });
      const { uploadId } = initRes.data;

      // 2. Prepare chunks queue
      const chunkNumbers = Array.from({ length: totalChunks }, (_, i) => i + 1);
      const CONCURRENCY = 3;
      let completedChunks = 0;

      const uploadPart = async (partNumber: number) => {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Derive IV for this part (IV + partNumber)
        const partIv = new Uint8Array(ivBase);
        const view = new DataView(partIv.buffer);
        view.setUint32(8, view.getUint32(8) + partNumber);

        const ciphertext = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: partIv },
          key,
          await chunk.arrayBuffer()
        );

        const { data: { url } } = await axios.get(`${API_BASE}/files/multipart/${uploadId}/part/${partNumber}`);
        await axios.put(url, ciphertext, {
          headers: { 'Content-Type': 'application/octet-stream' }
        });

        completedChunks++;
        setProgress(Math.round((completedChunks / totalChunks) * 100));
      };

      // 3. Parallel Processing
      const workers = Array(CONCURRENCY).fill(null).map(async () => {
        while (chunkNumbers.length > 0) {
          const num = chunkNumbers.shift();
          if (num) await uploadPart(num);
        }
      });
      await Promise.all(workers);

      // 4. Complete
      const linkRes = await axios.post(`${API_BASE}/links`, {
        fileId: uploadId,
        ttlHours: 24
      });

      const finalLink = `${window.location.origin}/download?id=${linkRes.data.id}#key=${keyStr}`;
      setShareLink(finalLink);

    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Upload falhou: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
            <Shield size={14} /> Zero-Knowledge File Sharing
          </div>
          <h1 className="text-6xl font-bold tracking-tight text-white">
            Vault<span className="gradient-text">Send</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Compartilhe arquivos com criptografia militar ponta-a-ponta. 
            Nem nós podemos ver seus dados.
          </p>
        </div>

        <div className="glass-card p-10 space-y-8">
          {!shareLink ? (
            <div 
              className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer ${
                file ? 'border-purple-500/50 bg-purple-500/5' : 'border-slate-800 hover:border-slate-700'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input 
                id="file-input"
                type="file" 
                className="hidden" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400">
                  {file ? <FileText size={32} className="text-purple-400" /> : <Upload size={32} />}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {file ? file.name : 'Clique para selecionar um arquivo'}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Arraste e solte arquivos aqui'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <CheckCircle2 size={24} />
                <span className="font-medium">Arquivo criptografado e enviado!</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-500 ml-1">Link Seguro (Chave incluída no fragmento)</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={shareLink}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm"
                  />
                  <button 
                    onClick={() => navigator.clipboard.writeText(shareLink)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl transition-colors"
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-xs text-amber-500/80 mt-2 flex gap-1 items-center">
                  <Lock size={12} /> Aviso: Quem tiver este link pode descriptografar o arquivo.
                </p>
              </div>
              <button 
                onClick={() => { setFile(null); setShareLink(null); }}
                className="w-full py-3 text-slate-400 hover:text-white transition-colors"
              >
                Enviar outro arquivo
              </button>
            </div>
          )}

          {!shareLink && (
            <div className="space-y-4">
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Enviando em partes criptografadas...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 transition-all duration-300 shadow-[0_0_10px_rgba(147,51,234,0.5)]" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              )}
              
              <button
                disabled={!file || isUploading}
                onClick={handleUpload}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Share2 size={20} />
                    Gerar Link Seguro
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 pt-4">
          {[
            { icon: <Lock size={20} />, label: 'E2EE AES-256' },
            { icon: <Shield size={20} />, label: 'Zero-Knowledge' },
            { icon: <Share2 size={20} />, label: 'Links Seguros' }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-slate-500">
              <div className="text-purple-500/50">{item.icon}</div>
              <span className="text-xs font-medium uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
