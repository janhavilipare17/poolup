import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveGoal } from '../utils/storage'
import { useWallet } from '../hooks/useWallet'
const EMOJIS = ['🏖️', '🎉', '🎂', '✈️', '🏕️', '🎮', '🍕', '🎁', '🏋️', '📚', '🎵', '🚗', '🌍', '💡', '🏠', '🎓']

function Create() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    desc: '',
    emoji: '🎯',
    amount: '',
    deadline: '',
    members: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const walletAddr = useWallet()
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.deadline) {
      alert('Please fill in goal name, amount and deadline!')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    saveGoal({
      name: form.name,
      desc: form.desc,
      emoji: form.emoji,
      target: parseFloat(form.amount),
      deadline: form.deadline,
      members: parseInt(form.members) || 2,
      organiser: walletAddr || 'GYOUR...WALLET'
    })
    setLoading(false)
    setSuccess(true)
    await new Promise(r => setTimeout(r, 1500))
    window.location.href = '/goals'
  }

  if (success) {
    return (
      <div style={styles.successWrap}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🚀</div>
          <div style={styles.successTitle}>Goal Deployed!</div>
          <div style={styles.successSub}>Your goal is now live on Stellar testnet</div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Create a Goal</div>
        <div style={styles.pageSub}>Lock funds on Stellar, share with your group, hit the target together</div>
      </div>

      <div style={styles.formWrap}>
        <div style={styles.formCard}>

          {/* top bar */}
          <div style={styles.topBar}></div>

          {/* goal details */}
          <div style={styles.sectionTitle}>
            <span style={styles.sectionLine}></span>
            Goal Details
            <span style={styles.sectionLine}></span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Goal name</label>
            <input
              style={styles.input}
              placeholder="e.g. Goa Trip 2025, Birthday Gift for Priya..."
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, minHeight: '90px', resize: 'vertical' }}
              placeholder="Tell your group what this goal is for..."
              value={form.desc}
              onChange={e => handleChange('desc', e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Pick an emoji for your goal</label>
            <div style={styles.emojiGrid}>
              {EMOJIS.map(e => (
                <button
                  key={e}
                  style={{ ...styles.emojiBtn, ...(form.emoji === e ? styles.emojiSelected : {}) }}
                  onClick={() => handleChange('emoji', e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* amount and deadline */}
          <div style={styles.sectionTitle}>
            <span style={styles.sectionLine}></span>
            Amount & Deadline
            <span style={styles.sectionLine}></span>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Target amount (XLM)</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputPrefix}>XLM</span>
                <input
                  style={{ ...styles.input, paddingLeft: '60px' }}
                  type="number"
                  placeholder="0"
                  min="1"
                  value={form.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Deadline</label>
              <input
                style={styles.input}
                type="date"
                value={form.deadline}
                onChange={e => handleChange('deadline', e.target.value)}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Number of contributors expected</label>
            <input
              style={styles.input}
              type="number"
              placeholder="0"
              min="2"
              value={form.members}
              onChange={e => handleChange('members', e.target.value)}
            />
            {form.amount && form.members && (
              <div style={styles.hint}>
                💡 Suggested share per person: {(form.amount / form.members).toFixed(2)} XLM
              </div>
            )}
          </div>

          {/* preview */}
          {form.name && (
            <div style={styles.preview}>
              <div style={styles.previewLabel}>Preview</div>
              <div style={styles.previewCard}>
                <div style={styles.previewTop}>
                  <span style={styles.previewEmoji}>{form.emoji}</span>
                  <span style={styles.previewStatus}>Active</span>
                </div>
                <div style={styles.previewName}>{form.name || 'Your Goal Name'}</div>
                <div style={styles.previewDesc}>{form.desc || 'Your goal description'}</div>
                <div style={styles.previewTrack}>
                  <div style={styles.previewBar}></div>
                </div>
                <div style={styles.previewMeta}>
                  <span>Target: {form.amount || '0'} XLM</span>
                  <span>Deadline: {form.deadline || 'Not set'}</span>
                </div>
              </div>
            </div>
          )}

          <button
            style={{ ...styles.submitBtn, opacity: loading ? .7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Deploying to Stellar...' : 'Deploy Goal to Stellar ✦'}
          </button>

        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { paddingTop: '64px', position: 'relative', zIndex: 1 },
  header: { padding: '3rem 2rem 1.5rem', maxWidth: '680px', margin: '0 auto' },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.02em' },
  pageSub: { color: '#8a9cc4', fontSize: '.95rem', marginTop: '.5rem', fontWeight: 300 },
  formWrap: { maxWidth: '680px', margin: '0 auto', padding: '0 2rem 4rem' },
  formCard: { background: '#111827', border: '1px solid #1e2d47', borderRadius: '28px', padding: '2.5rem', position: 'relative', overflow: 'hidden' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #4f8ef7, #7c3aed, #06d6a0)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: 700, color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '.08em', margin: '1.5rem 0 1.25rem' },
  sectionLine: { flex: 1, height: '1px', background: '#1e2d47', display: 'block' },
  formGroup: { marginBottom: '1.25rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { fontSize: '13px', color: '#8a9cc4', marginBottom: '.5rem', display: 'block', fontWeight: 400 },
  input: { width: '100%', background: '#080d1c', border: '1px solid #1e2d47', color: '#f0f4ff', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', transition: '.2s' },
  inputWrap: { position: 'relative' },
  inputPrefix: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#4a5a7a', fontSize: '12px', fontWeight: 500, zIndex: 1 },
  hint: { fontSize: '12px', color: '#4f8ef7', marginTop: '.5rem', background: 'rgba(79,142,247,.08)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(79,142,247,.15)' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px', marginTop: '.5rem' },
  emojiBtn: { width: '100%', aspectRatio: '1', background: '#080d1c', border: '1px solid #1e2d47', borderRadius: '10px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '.15s' },
  emojiSelected: { borderColor: '#4f8ef7', background: 'rgba(79,142,247,.1)' },
  preview: { marginBottom: '1.5rem' },
  previewLabel: { fontSize: '11px', color: '#4a5a7a', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.5rem', fontWeight: 600 },
  previewCard: { background: '#080d1c', border: '1px solid #1e2d47', borderRadius: '16px', padding: '1.25rem' },
  previewTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem' },
  previewEmoji: { fontSize: '24px' },
  previewStatus: { fontSize: '11px', background: 'rgba(16,185,129,.12)', color: '#10b981', padding: '3px 10px', borderRadius: '100px', fontWeight: 600, textTransform: 'uppercase' },
  previewName: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, marginBottom: '.25rem' },
  previewDesc: { fontSize: '12px', color: '#8a9cc4', marginBottom: '1rem', fontWeight: 300 },
  previewTrack: { height: '5px', background: '#0d1428', borderRadius: '100px', marginBottom: '.5rem' },
  previewBar: { height: '100%', width: '0%', background: 'linear-gradient(90deg, #4f8ef7, #7c3aed)', borderRadius: '100px' },
  previewMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#4a5a7a' },
  submitBtn: { width: '100%', background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', color: '#fff', border: 'none', padding: '15px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne', sans-serif", letterSpacing: '.02em', transition: 'all .25s', marginTop: '.5rem' },
  successWrap: { paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  successCard: { textAlign: 'center', padding: '3rem' },
  successIcon: { fontSize: '5rem', marginBottom: '1rem' },
  successTitle: { fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '.5rem' },
  successSub: { color: '#8a9cc4', fontSize: '1rem', fontWeight: 300 },
}

export default Create