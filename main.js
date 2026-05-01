import './styles.css'

const app = document.querySelector('#app')

const params = new URLSearchParams(window.location.search)
const sharedMessage = params.get('note')
const legacyDecodedMessage = sharedMessage ? decodeURIComponent(atob(sharedMessage)) : ''

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
const incomingBody = incomingPayload?.message || legacyDecodedMessage
const hasIncomingMessage = Boolean(incomingBody)

const state = {
  from: incomingTo || '',
  to: incomingFrom || '',
  draft: '',
  sent: false,
  noteOpened: false,
  copied: false,
}

const escapeHtml = (str = '') =>
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
  const previewText = state.draft
    ? escapeHtml(state.draft).replace(/\n/g, '<br>')
    : '<span class="placeholder">Write your little note here...</span>'

  const incomingText = hasIncomingMessage
    ? escapeHtml(incomingBody).replace(/\n/g, '<br>')
    : ''

  const shareLink = state.sent
    ? makeShareLink({ from: state.from.trim(), to: state.to.trim(), message: state.draft })
    : ''

  const showReplyComposer = !hasIncomingMessage || state.noteOpened
  const heroModeClass = hasIncomingMessage ? 'hero recipient-mode' : 'hero composer-mode'

  app.innerHTML = `
    <main class="page">
      <section class="${heroModeClass}">
        <div class="hero-copy">
          <span class="badge">Pigeon Messenger</span>
          <h1>${hasIncomingMessage ? 'A pigeon has arrived.' : 'Send a note by extremely committed bird.'}</h1>
          <p class="subtitle">${hasIncomingMessage ? 'Untie the note from its tiny little foot, read the message, and send one back with your own bird if the mood strikes.' : 'Write a message on a little paper, tie it to a pigeon, and share the link. Your friend can untie the note, read it, and send one back with her own bird if she wants.'}</p>
          <p class="flair">${randomPigeonLine()}</p>
          ${hasIncomingMessage && (incomingFrom || incomingTo) ? `<p class="address-line">from <strong>${escapeHtml(incomingFrom || '____')}</strong> to <strong>${escapeHtml(incomingTo || '____')}</strong></p>` : ''}
        </div>

        <div class="scene">
          <div class="cloud cloud-a"></div>
          <div class="cloud cloud-b"></div>
          <div class="pigeon-card ${hasIncomingMessage ? 'incoming-card' : ''}">
            <div class="string ${hasIncomingMessage ? 'string-incoming' : ''}"></div>

            <div class="paper-preview ${hasIncomingMessage ? 'paper-tied incoming-paper' : ''}">
              <div class="paper-lines">${hasIncomingMessage ? '<span class=\"paper-seal\">sealed note</span>' : previewText}</div>
            </div>

            <div class="pigeon ${hasIncomingMessage ? 'pigeon-delivering' : 'pigeon-idle'}" aria-label="cute pigeon illustration">
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

            ${hasIncomingMessage ? `
              <div class="delivery-panel">
                <button id="untieBtn" class="untie-btn" ${state.noteOpened ? 'disabled' : ''}>${state.noteOpened ? 'Note untied' : 'Untie the note'}</button>
                <div class="hidden-note ${state.noteOpened ? 'open' : ''}">
                  <div class="received-paper">
                    <h2>Message found:</h2>
                    <p>${incomingText}</p>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </section>

      ${showReplyComposer ? `
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
              <h2>${state.sent ? 'Pigeon launched.' : hasIncomingMessage ? 'Send one back.' : 'Waiting for dispatch.'}</h2>
              <p>${state.sent ? 'Share this link with your person. The bird knows the route. Probably.' : hasIncomingMessage ? 'Reply if you like. Diplomatic pigeon channels remain open.' : 'Write a note first. The pigeon refuses to carry blank correspondence.'}</p>
              ${state.sent ? `
                <div class="link-row">
                  <input id="shareLink" value="${shareLink}" readonly />
                  <button id="copyBtn" class="copy-btn">${state.copied ? 'Copied' : 'Copy link'}</button>
                </div>
              ` : ''}
            </div>
          </div>
        </section>
      ` : ''}
    </main>
  `

  const fromInput = document.querySelector('#from')
  const toInput = document.querySelector('#to')
  const noteInput = document.querySelector('#note')

  fromInput?.addEventListener('input', (e) => {
    state.from = e.target.value
  })

  toInput?.addEventListener('input', (e) => {
    state.to = e.target.value
  })

  noteInput?.addEventListener('input', (e) => {
    state.draft = e.target.value
    const counter = document.querySelector('.composer-footer span')
    if (counter) counter.textContent = `${state.draft.length}/280 pigeon-approved characters`

    const preview = document.querySelector('.paper-preview .paper-lines')
    if (preview && !hasIncomingMessage) {
      preview.innerHTML = state.draft
        ? escapeHtml(state.draft).replace(/\n/g, '<br>')
        : '<span class=\"placeholder\">Write your little note here...</span>'
    }
  })

  document.querySelector('#sendBtn')?.addEventListener('click', () => {
    if (!state.draft.trim()) return
    state.sent = true
    state.copied = false
    render()
  })

  document.querySelector('#copyBtn')?.addEventListener('click', async () => {
    const input = document.querySelector('#shareLink')
    if (!input) return
    await navigator.clipboard.writeText(input.value)
    state.copied = true
    render()
  })

  document.querySelector('#untieBtn')?.addEventListener('click', () => {
    state.noteOpened = true
    render()
  })
}

render()
