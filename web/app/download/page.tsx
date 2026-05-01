"use client";

import { Suspense, useEffect, useState } from 'react';
import { Download, Lock, Shield, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { decryptFile, importKey } from '@/lib/crypto';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

function DownloadContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'decrypting'>('loading');
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID do arquivo não fornecido.');
      setStatus('error');
      return;
    }

    const fetchMetadata = async () => {
      try {
        const res = await axios.get(`${API_BASE}/links/${id}`);
        setMetadata(res.data);
        setStatus('ready');
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('Link expirado ou inexistente.');
        setStatus('error');
      }
    };
    fetchMetadata();
  }, [id]);

  const handleDownload = async () => {
    if (!metadata) return;

    try {
      setStatus('decrypting');
      
      const fragment = window.location.hash;
      const keyMatch = fragment.match(/key=([^&]*)/);
      if (!keyMatch) throw new Error('Chave de criptografia não encontrada na URL.');
      
      const keyStr = keyMatch[1];
      const keyBuffer = await importKey(keyStr);

      const response = await axios.get(metadata.downloadUrl, {
        responseType: 'arraybuffer'
      });

      const ivBuffer = Uint8Array.from(atob(metadata.metadata.iv), c => c.charCodeAt(0));
      const decryptedBlob = await decryptFile(
        response.data,
        keyBuffer,
        ivBuffer
      );

      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = atob(metadata.metadata.encryptedName);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setStatus('ready');
    } catch (err: any) {
      console.error('Decryption failed:', err);
      setError('Falha na descriptografia. Verifique se o link está correto.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md w-full glass-card p-10 space-y-8 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-3xl bg-purple-600/10 flex items-center justify-center text-purple-500">
          <Lock size={40} />
        </div>
      </div>

      {status === 'loading' && (
        <div className="space-y-4 py-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
          <p className="text-slate-400">Verificando link seguro...</p>
        </div>
      )}

      {status === 'ready' && metadata && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Arquivo Disponível</h1>
            <p className="text-slate-400 text-sm">Este arquivo está criptografado ponta-a-ponta.</p>
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400">
              <FileText size={24} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-white font-medium truncate">{atob(metadata.metadata.encryptedName)}</p>
              <p className="text-slate-500 text-xs">{(metadata.metadata.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Descriptografar e Baixar
          </button>
        </div>
      )}

      {status === 'decrypting' && (
        <div className="space-y-4 py-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
          <p className="text-white font-medium">Descriptografando...</p>
          <p className="text-slate-500 text-xs px-8">Isso acontece inteiramente no seu navegador. Nossos servidores nunca veem seus dados.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <div className="flex justify-center text-red-500 bg-red-500/10 p-4 rounded-full w-16 h-16 mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Ops!</h2>
            <p className="text-slate-400">{error}</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-500 text-xs">
        <Shield size={12} />
        <span>Segurança garantida por Web Crypto API</span>
      </div>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
      <Suspense fallback={
        <div className="max-w-md w-full glass-card p-10 space-y-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
          <p className="text-slate-400">Carregando...</p>
        </div>
      }>
        <DownloadContent />
      </Suspense>
    </main>
  );
}
