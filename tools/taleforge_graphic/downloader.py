"""큰 파일 다운로드(이어받기 지원, 표준 라이브러리만 사용).

사용자가 이미 쓰는 'simple ui confirm' 도구의 downloader.py(변경 #149까지
다듬어진 버전)의 핵심 `download()` 함수를 그대로 포팅했다 — 이어받기/
리다이렉트 시 인증 헤더 제거 같은 디테일은 이미 그 도구가 실전에서 다듬은
것이라 새로 짜지 않았다. Wan/SVI 전용 파일 목록 같은 이 도구와 무관한
내용은 가져오지 않았다.
"""
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (compatible; taleforge-graphic/1.0)"}


class _NoAuthOnRedirect(urllib.request.HTTPRedirectHandler):
    """다른 사이트로 넘어가는 리다이렉트에는 Authorization 헤더를 빼고 보낸다
    (HuggingFace → CDN 서명 주소에 토큰이 같이 가면 거절되는 문제 방지)."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        new = super().redirect_request(req, fp, code, msg, headers, newurl)
        if new is not None and urllib.parse.urlparse(newurl).hostname != urllib.parse.urlparse(req.full_url).hostname:
            for k in list(new.headers):
                if k.lower() == "authorization":
                    del new.headers[k]
            for k in list(new.unredirected_hdrs):
                if k.lower() == "authorization":
                    del new.unredirected_hdrs[k]
        return new


def _open(req, timeout=60):
    return urllib.request.build_opener(_NoAuthOnRedirect).open(req, timeout=timeout)


def download(url, dest, progress=None, headers=None):
    """url -> dest. 중간에 끊겨도 dest.part 부터 이어받는다.
    progress(done_bytes, total_bytes) 콜백이 있으면 매 1MB마다 호출."""
    dest = Path(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    part = dest.with_suffix(dest.suffix + ".part")
    done = part.stat().st_size if part.exists() else 0
    hdrs = dict(UA)
    hdrs.update(headers or {})
    if done:
        hdrs["Range"] = f"bytes={done}-"
    try:
        resp = _open(urllib.request.Request(url, headers=hdrs), timeout=60)
    except urllib.error.HTTPError as e:
        if e.code == 416 and part.exists():  # 이미 끝까지 받은 상태
            part.replace(dest)
            return
        if e.code == 404:
            raise IOError(f"파일을 찾을 수 없어요(404) — 주소가 바뀌었거나 삭제됐을 수 있어요: {url}")
        raise IOError(f"다운로드 실패({e.code}): {url}")
    except urllib.error.URLError as e:
        raise IOError(f"연결 실패: {e.reason}")
    if done and resp.status != 206:  # 서버가 이어받기를 무시 -> 처음부터
        done = 0
    total = int(resp.headers.get("Content-Length", 0)) + done
    with open(part, "ab" if done else "wb") as f:
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
            done += len(chunk)
            if progress:
                progress(done, total)
    if total and done < total:
        raise IOError(f"다운로드가 중간에 끊겼습니다({done}/{total} 바이트). 다시 누르면 이어받습니다.")
    part.replace(dest)
