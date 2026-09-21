'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Metric {
  id: string;
  sport: string;
  metric_name: string;
  metric_value: number;
  unit: string;
  created_at: string;
}

export default function Home() {
  const [sport, setSport] = useState('Vóley');
  const [metricName, setMetricName] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [unit, setUnit] = useState('cm');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [metrics, setMetrics] = useState<Metric[]>([]);

  // Consultar las métricas almacenadas en Supabase
  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('metrics_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMetrics(data);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('metrics_logs').insert([
      {
        sport,
        metric_name: metricName,
        metric_value: parseFloat(metricValue),
        unit,
      },
    ]);

    setLoading(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('¡Métrica guardada exitosamente!');
      setMetricName('');
      setMetricValue('');
      fetchMetrics(); // Recargar la lista automáticamente
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-950 text-white p-6 pt-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-8">
        <h1 className="text-2xl font-bold text-blue-500 mb-2">
          Sports Performance App
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Registrar nueva marca deportiva
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Deporte
            </label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="Vóley">Vóley</option>
              <option value="Básquetbol">Básquetbol</option>
              <option value="Fútbol">Fútbol</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Métrica / Ejercicio
            </label>
            <input
              type="text"
              placeholder="Ej: Salto Vertical"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Valor
              </label>
              <input
                type="number"
                step="any"
                placeholder="Ej: 75"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Unidad
              </label>
              <input
                type="text"
                placeholder="Ej: cm, sec, kg"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:outline-none focus:border-blue-500 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Métrica'}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-sm text-center font-medium ${
              message.startsWith('Error') ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Historial de Registros */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-200 mb-4">
          Historial de Registros
        </h2>
        {metrics.length === 0 ? (
          <p className="text-sm text-slate-500 text-center">
            No hay registros aún.
          </p>
        ) : (
          <div className="space-y-3">
            {metrics.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-800 border border-slate-700/60 p-3 rounded-lg text-sm"
              >
                <div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 mr-2">
                    {item.sport}
                  </span>
                  <span className="font-medium text-slate-200">
                    {item.metric_name}
                  </span>
                </div>
                <div className="font-bold text-slate-100">
                  {item.metric_value}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}