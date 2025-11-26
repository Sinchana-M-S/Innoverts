# video_translator.py
import os
import uuid
import base64
import requests
from moviepy.editor import VideoFileClip, AudioFileClip
from pydub import AudioSegment
from dotenv import load_dotenv
import time

load_dotenv()
SARVAM_KEY = os.getenv("SARVAM_API_KEY")
if not SARVAM_KEY:
    raise Exception("SARVAM_API_KEY not set in environment (.env)")

# Map of languages and Sarvam configs
VOICE_MAP = {
    "en": {"lang_code": "en-IN", "speaker": "anushka"},
    "hi": {"lang_code": "hi-IN", "speaker": "abhilash"},
    "te": {"lang_code": "te-IN", "speaker": "anushka"},
    "kn": {"lang_code": "kn-IN", "speaker": "manisha"},
}

BASE_DIR = os.path.abspath(".")
UPLOAD_TMP = os.path.join(BASE_DIR, "uploads", "tmp")
PROCESSED_DIR = os.path.join(BASE_DIR, "processed")
os.makedirs(UPLOAD_TMP, exist_ok=True)
for k in VOICE_MAP.keys():
    os.makedirs(os.path.join(PROCESSED_DIR, k), exist_ok=True)


# ------------- Helpers -------------
def safe_write_bytes(path: str, data: bytes):
    d = os.path.dirname(path)
    if d and not os.path.exists(d):
        os.makedirs(d, exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)


# 1) Speech -> Text (Sarvam)
def sarvam_stt(audio_path: str):
    url = "https://api.sarvam.ai/speech-to-text"
    with open(audio_path, "rb") as f:
        files = {"file": ("audio.wav", f, "audio/wav")}
        data = {"model": "saarika:v2", "language_code": "unknown", "with_timestamps": "false"}
        headers = {"api-subscription-key": SARVAM_KEY}
        r = requests.post(url, headers=headers, data=data, files=files, timeout=120)

    # debug printing
    print("\n===== SARVAM STT DEBUG =====")
    print("STATUS:", r.status_code)
    print("RAW:", r.text)
    print("============================\n")

    if r.status_code != 200:
        return None

    j = r.json()
    return j.get("transcript", "")


# 2) Translate (Sarvam translate). If source==target, returns original text.
def sarvam_translate(text: str, target_lang_code: str, source_lang_code: str = "en-IN"):
    # skip if same
    if source_lang_code == target_lang_code:
        return text

    url = "https://api.sarvam.ai/translate"
    payload = {
        "input": text,
        "source_language_code": source_lang_code,
        "target_language_code": target_lang_code,
        "mode": "formal",
        "speaker_gender": "Female",
        "model": "mayura:v1",
    }
    headers = {"Content-Type": "application/json", "api-subscription-key": SARVAM_KEY}
    r = requests.post(url, json=payload, headers=headers, timeout=120)
    if r.status_code != 200:
        print("⚠️ Translation failed, returning original. RAW:", r.text)
        return text
    j = r.json()
    return j.get("translated_text", text)


# 3) Text -> Speech (Sarvam TTS). Returns path to WAV file.
def sarvam_tts_to_wav(text: str, lang_key: str):
    cfg = VOICE_MAP[lang_key]
    lang_code = cfg["lang_code"]
    speaker = cfg["speaker"]

    if not text or not text.strip():
        text = "Audio not available."

    # chunk text into manageable pieces (avoid huge payloads)
    import re
    sentences = re.split(r'(?<=[.!?])\s+', text)

    merged = None
    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue
        # further chunk if too long
        while len(sent) > 400:
            chunk = sent[:400].rsplit(" ", 1)[0]
            chunk_path = _request_tts(chunk, lang_code, speaker)
            seg = AudioSegment.from_file(chunk_path)
            merged = seg if merged is None else merged + seg
            os.remove(chunk_path)
            sent = sent[len(chunk):].strip()
        # final chunk
        chunk_path = _request_tts(sent, lang_code, speaker)
        seg = AudioSegment.from_file(chunk_path)
        merged = seg if merged is None else merged + seg
        os.remove(chunk_path)

    if merged is None:
        raise Exception("TTS produced no audio")

    out_path = os.path.join(UPLOAD_TMP, f"tts_{uuid.uuid4()}.wav")
    merged.export(out_path, format="wav")
    return out_path


def _request_tts(chunk_text: str, lang_code: str, speaker: str):
    """Call Sarvam TTS for a chunk. Returns a temporary audio file path (mp3/wav)"""
    url = "https://api.sarvam.ai/text-to-speech"

    payload = {
        "inputs": [chunk_text],
        "target_language_code": lang_code,
        "speaker": speaker,
        "pitch": 0,
        "pace": 1.0,
        "loudness": 1.0,
        "speech_sample_rate": 24000,
        "model": "bulbul:v2",
    }

    headers = {"api-subscription-key": SARVAM_KEY, "Content-Type": "application/json"}
    r = requests.post(url, json=payload, headers=headers, timeout=120)

    # Sometimes the API returns raw audio bytes, sometimes JSON with base64 "audios"
    if r.status_code != 200:
        print("TTS error:", r.status_code, r.text)
        raise Exception("TTS Error: " + r.text)

    # try to parse JSON -> audios
    try:
        j = r.json()
        if "audios" in j and isinstance(j["audios"], list) and j["audios"]:
            b64 = j["audios"][0]
            audio_bytes = base64.b64decode(b64)
            tmp = os.path.join(UPLOAD_TMP, f"tts_chunk_{uuid.uuid4()}.mp3")
            safe_write_bytes(tmp, audio_bytes)
            # convert to wav using pydub
            wav_tmp = tmp.replace(".mp3", ".wav")
            AudioSegment.from_file(tmp).export(wav_tmp, format="wav")
            os.remove(tmp)
            return wav_tmp
    except ValueError:
        # not json
        pass

    # fallback: treat content as binary audio (mp3)
    tmp = os.path.join(UPLOAD_TMP, f"tts_chunk_{uuid.uuid4()}.mp3")
    safe_write_bytes(tmp, r.content)
    wav_tmp = tmp.replace(".mp3", ".wav")
    AudioSegment.from_file(tmp).export(wav_tmp, format="wav")
    os.remove(tmp)
    return wav_tmp


# 4) Merge audio with video (overwrite original audio)
def merge_audio_with_video(video_path: str, audio_wav_path: str, output_path: str):
    video = VideoFileClip(video_path)
    audio = AudioFileClip(audio_wav_path)
    new_video = video.set_audio(audio)
    # ensure output dir exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    new_video.write_videofile(output_path, codec="libx264", audio_codec="aac", threads=0, logger=None)
    # close resources
    audio.close()
    video.close()
    new_video.close()


# Top-level process function
def process_all_languages(video_path: str, video_counter: int):
    """
    Extract audio -> STT -> Translate -> TTS -> Merge
    Returns: dict {lang_key: output_video_path}
    """
    video_path = os.path.abspath(video_path)
    print("🎞 Processing:", video_path)

    # extract audio to tmp wav
    tmp_audio = os.path.join(UPLOAD_TMP, f"{uuid.uuid4()}_original.wav")
    os.makedirs(os.path.dirname(tmp_audio), exist_ok=True)
    clip = VideoFileClip(video_path)
    try:
        clip.audio.write_audiofile(tmp_audio, logger=None)
    finally:
        # we keep clip open for merging, but close later if needed
        clip.close()

    print("🎧 Extracted:", tmp_audio)

    # Run STT
    transcript = sarvam_stt(tmp_audio)
    if not transcript:
        raise Exception("Speech-to-text failed or returned empty transcript")

    print("📝 Transcript:", transcript)

    outputs = {}
    # attempt to detect source lang from STT result? Sarvam returns language_code sometimes; we used 'unknown' so assume en-IN by default
    source_lang_code = "en-IN"

    for lang_key, cfg in VOICE_MAP.items():
        try:
            print(f"\n🌐 Processing {lang_key} ...")
            target_lang_code = cfg["lang_code"]
            # translate text
            translated = sarvam_translate(transcript, target_lang_code, source_lang_code)
            print("💬 Translated:", translated[:120], "..." if len(translated) > 120 else "")
            # TTS
            tts_wav = sarvam_tts_to_wav(translated, lang_key)
            print("🔊 TTS produced:", tts_wav)
            # merge
            out_file = os.path.join(PROCESSED_DIR, lang_key, f"video{video_counter}.mp4")
            merge_audio_with_video(video_path, tts_wav, out_file)
            print("✅ Saved:", out_file)
            outputs[lang_key] = os.path.abspath(out_file)
            # cleanup tts wav
            try:
                os.remove(tts_wav)
            except:
                pass
            time.sleep(0.5)  # small pause
        except Exception as e:
            print(f"⚠️ Failed for {lang_key}:", e)
            # skip failing language (do not raise to allow partial outputs)
            continue

    # cleanup original tmp audio
    try:
        if os.path.exists(tmp_audio):
            os.remove(tmp_audio)
    except:
        pass

    if not outputs:
        raise Exception("Processing failed for all languages")

    return outputs
