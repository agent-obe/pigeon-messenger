import './styles.css'

const app = document.querySelector('#app')

const params = new URLSearchParams(window.location.search)
const sharedMessage = params.get('note')
const decodedSharedMessage = sharedMessage ? decodeURIComponent(atob(sharedMessage)) : ''

const decodePayload = (raw) => {
  try {
    return JSON.parse(decodeURIComponent(atob(raw)))
  } catch {
    return null
  }
}

const incomingPayload = sharedMessage ? decodePayload(sharedMessage) : null
const incomingFrom = incomingPayload?.from || ''
const incomingTo = incomingPayload?.to || ''
const incomingBody = incomingPayload?.message || decodedSharedMessage

const state = {
  from: incomingTo || '',
  to: incomingFrom || '',
  draft: incomingBody ? '' : 'Meet me where the breadcrumbs are suspiciously well arranged.',
  sent: false,
}

const escapeHtml = (str) =>
  str.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]))

const encodePayload = (payload) => btoa(encodeURIComponent(JSON.stringify(payload)))

const makeShareLink = (payload) => `${window.location.origin}${window.location.pathname}?note=${encodePayload(payload)}`

const randomPigeonLine = () => {
  const lines = [
    'Courier coo standing by.',
    'This pigeon has excellent union benefits.',
    'Tiny foot-string technology: surprisingly robust.',
    'No push notifications. Only flapping.',
    'Message delivery speed: emotionally fast, physically unclear.',
  ]
  return lines[Math.floor(Math.random() * lines.length)]
}

const render = () => {
  const paperContent = state.draft
    ? escapeHtml(state.draft).replace(/\n/g, '<br>')
    : '<span class="placeholder">Write your little note here...</span>'

  const shareLink = state.sent
    ? makeShareLink({ from: state.from.trim(), to: state.to.trim(), message: state.draft })
    : ''

  app.innerHTML = `
    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <span class="badge">Pigeon Messenger</span>
          <h1>Send a note by extremely committed bird.</h1>
          <p class="subtitle">Write a message on a little paper, tie it to a pigeon, and share the link. Your friend can untie the note, read it, and send one back with her own bird if she wants.</p>
          <p class="flair">${randomPigeonLine()}</p>
        </div>
        <div class="scene">
          <div class="cloud cloud-a"></div>
          <div class="cloud cloud-b"></div>
          <div class="pigeon-card">
            <div class="string"></div>
            <div class="paper-preview">
              <div class="paper-lines">${paperContent}</div>
            </div>
            <div class="pigeon" aria-label="cute pigeon illustration">
              <div class="wing"></div>
              <div class="body"></div>
              <div class="belly"></div>
              <div class="neck"></div>
              <div class="head"></div>
              <div class="beak"></div>
              <div class="eye"></div>
              <div class="blush"></div>
              <div class="tail"></div>
              <div class="leg leg-a"></div>
              <div class="leg leg-b"></div>
              <div class="foot foot-a"></div>
              <div class="foot foot-b"></div>
            </div>
          </div>
        </div>
      </section>

      ${incomingBody ? `
        <section class="receive-section">
          <div class="receive-card">
            <div class="receive-header">
              <span>Incoming pigeon delivery</span>
              <button id="untieBtn" class="untie-btn">Untie the note</button>
            </div>
            <div id="hiddenNote" class="hidden-note">
              <div class="received-paper">
                <h2>Message found:</h2>
                ${(incomingFrom || incomingTo) ? `<p class="meta-note">from <strong>${escapeHtml(incomingFrom || '____')}</strong> to <strong>${escapeHtml(incomingTo || '____')}</strong></p>` : ''}
                <p>${escapeHtml(incomingBody).replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            <p class="tiny">If the note is cute, legally you may reply with another pigeon.</p>
          </div>
        </section>
      ` : ''}

      <section class="composer-section">
        <div class="composer">
          <div class="paper">
            <div class="paper-top">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <div class="name-row">
              <div>
                <label for="from" class="label">From</label>
                <input id="from" maxlength="40" placeholder="____" value="${escapeHtml(state.from)}" />
              </div>
              <div>
                <label for="to" class="label">To</label>
                <input id="to" maxlength="40" placeholder="____" value="${escapeHtml(state.to)}" />
              </div>
            </div>
            <label for="note" class="label">Your message</label>
            <textarea id="note" maxlength="280" placeholder="Dear mysterious recipient...">${escapeHtml(state.draft)}</textarea>
            <div class="composer-footer">
              <span>${state.draft.length}/280 pigeon-approved characters</span>
              <button id="sendBtn" class="send-btn">Attach to pigeon</button>
            </div>
          </div>

          <div class="share-box ${state.sent ? 'active' : ''}">
            <h2>${state.sent ? 'Pigeon launched.' : 'Waiting for dispatch.'}</h2>
            <p>${state.sent ? 'Share this link with your friend. The bird knows the route. Probably.' : 'Write a note first. The pigeon refuses to carry blank correspondence.'}</p>
            ${state.sent ? `
              <div class="link-row">
                <input id="shareLink" value="${shareLink}" readonly />
                <button id="copyBtn" class="copy-btn">Copy link</button>
              </div>
            ` : ''}
          </div>
        </div>
      </section>
    </main>
  `

  document.querySelector('#from')?.addEventListener('input', (e) => {
    state.from = e.target.value
    render()
  })

  document.querySelector('#to')?.addEventListener('input', (e) => {
    state.to = e.target.value
    render()
  })

  document.querySelector('#note')?.addEventListener('input', (e) => {
    state.draft = e.target.value
    render()
  })

  document.querySelector('#sendBtn')?.addEventListener('click', () => {
    if (!state.draft.trim()) return
    state.sent = true
    render()
  })

  document.querySelector('#copyBtn')?.addEventListener('click', async () => {
    const input = document.querySelector('#shareLink')
    if (!input) return
    await navigator.clipboard.writeText(input.value)
    const btn = document.querySelector('#copyBtn')
    const original = btn.textContent
    btn.textContent = 'Copied'
    setTimeout(() => (btn.textContent = original), 1200)
  })

  document.querySelector('#untieBtn')?.addEventListener('click', () => {
    document.querySelector('#hiddenNote')?.classList.add('open')
    document.querySelector('#untieBtn')?.setAttribute('disabled', 'true')
    document.querySelector('#untieBtn').textContent = 'Note untied'
  })
}

render()
