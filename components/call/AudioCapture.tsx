'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import sentiment from 'wink-sentiment'
import {
  Mic,
  Square,
  Upload,
  Loader2,
  Wand2,
  Play,
  Pause,
  Trash2
} from 'lucide-react'

interface AudioCaptureProps {
  llamadaId: string
  onUploaded?: (data: { audioUrl: string }) => void
  onTranscribed?: () => void
  existingAudio?: string | null
  existingDuration?: number | null
}

export function AudioCapture({
  llamadaId,
  onUploaded,
  onTranscribed,
  existingAudio,
  existingDuration = null
}: AudioCaptureProps) {
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudio || null)
  const [duration, setDuration] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const transcriberRef = useRef<any>(null)

  useEffect(() => {
    if (existingAudio) {
      setAudioUrl(existingAudio)
    }
    if (existingDuration && !duration) {
      setDuration(existingDuration)
    }
  }, [existingAudio, existingDuration])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const displayedDuration = duration || existingDuration || 0

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setRecording(true)
      setDuration(0)
      startTimer()
    } catch (error) {
      console.error(error)
      toast.error('No se pudo acceder al micrófono')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
    mediaRecorderRef.current = null
    setRecording(false)
    stopTimer()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioBlob(file)
      setAudioUrl(URL.createObjectURL(file))
      const audio = new Audio(URL.createObjectURL(file))
      audio.onloadedmetadata = () => {
        setDuration(Math.round(audio.duration))
      }
    }
  }

  const handleUpload = async () => {
    if (!audioBlob) {
      toast.error('No hay audio para subir')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('audio', audioBlob, `llamada-${llamadaId}.webm`)
      formData.append('llamadaId', llamadaId)
      formData.append('duration', duration.toString())

      const response = await fetch('/api/llamadas-frio/upload-audio', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al subir audio')
      }

      const result = await response.json()
      setAudioBlob(null)
      onUploaded?.({ audioUrl: result.url })
      toast.success('Audio guardado correctamente')
    } catch (error: any) {
      toast.error('Error al subir audio', { description: error.message })
    } finally {
      setUploading(false)
    }
  }

  const togglePlayback = () => {
    if (!audioUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  const extractKeywords = (text: string, max = 8) => {
    const stopwords = new Set(['la', 'el', 'los', 'las', 'de', 'del', 'y', 'a', 'en', 'que', 'se', 'por', 'para', 'con', 'un', 'una'])
    const counts: Record<string, number> = {}
    text
      .toLowerCase()
      .replace(/[.,!?¿¡;:]/g, '')
      .split(/\s+/)
      .forEach((word) => {
        if (word.length > 3 && !stopwords.has(word)) {
          counts[word] = (counts[word] || 0) + 1
        }
      })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([palabra, total]) => ({ palabra, total }))
  }

  const handleTranscribe = async () => {
    if (!audioBlob && !audioUrl) {
      toast.error('Guarda un audio antes de transcribir')
      return
    }
    try {
      setTranscribing(true)
      let blobToUse = audioBlob
      if (!blobToUse && audioUrl) {
        const res = await fetch(audioUrl)
        blobToUse = await res.blob()
      }
      if (!blobToUse) throw new Error('No hay audio disponible para transcribir')

      if (!transcriberRef.current) {
        const transformers = await import('@xenova/transformers')
        transcriberRef.current = await transformers.pipeline('automatic-speech-recognition', 'Xenova/whisper-small')
      }

      const result = await transcriberRef.current(blobToUse, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true
      })

      const texto = result?.text || ''
      const segmentos = result?.chunks || []
      const resumen = texto ? `${texto.slice(0, 280)}${texto.length > 280 ? '…' : ''}` : ''
      const sentimiento = sentiment(texto || '')
      const palabrasClave = extractKeywords(texto)
      const analitica = {
        totalSegmentos: segmentos.length,
        duracionEstimada: duration || existingDuration || null,
        scoreSentimiento: sentimiento.score,
        comparativo: sentimiento.comparative
      }

      const response = await fetch('/api/llamadas-frio/save-transcripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llamadaId,
          texto,
          segmentos,
          resumen,
          sentimiento: sentimiento.score > 0 ? 'positivo' : sentimiento.score < 0 ? 'negativo' : 'neutral',
          palabrasClave,
          analitica
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al transcribir')
      }
      toast.success('Transcripción completada')
      onTranscribed?.()
    } catch (error: any) {
      toast.error('Error al transcribir', { description: error.message })
    } finally {
      setTranscribing(false)
    }
  }

  const resetLocalAudio = () => {
    setAudioBlob(null)
    setAudioUrl(existingAudio || null)
    setDuration(existingDuration || 0)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <p className="text-sm font-semibold text-slate-700 mb-3">Grabar nueva llamada</p>
        <div className="flex items-center gap-3">
          <Button
            onClick={recording ? stopRecording : startRecording}
            className={recording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {recording ? (
              <>
                <Square className="h-4 w-4 mr-2" /> Detener
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" /> Grabar
              </>
            )}
          </Button>
          <div className="text-sm text-slate-600">
            {recording ? 'Grabando...' : 'Listo para grabar'}
          </div>
        </div>
        <div className="mt-2">
          <Progress value={(displayedDuration % 60) * 1.666} />
          <p className="text-xs text-slate-500 mt-1">Duración: {displayedDuration}s</p>
        </div>
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-semibold text-slate-700">O subir archivo</label>
        <Input type="file" accept="audio/*" onChange={handleFileSelect} />
      </div>

      {audioUrl && (
        <div className="rounded-xl border border-slate-200 p-3 space-y-3">
          <p className="text-sm font-semibold text-slate-700">Audio preparado</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={togglePlayback}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="ml-2">{playing ? 'Pausar' : 'Reproducir'}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={resetLocalAudio}>
              <Trash2 className="h-4 w-4 mr-1" /> Limpiar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Guardar audio
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleTranscribe}
              disabled={transcribing}
            >
              {transcribing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Transcribiendo
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" /> Transcribir
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

