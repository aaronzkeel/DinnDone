/**
 * Design Demo Page
 * Shows all button variants for visual verification of DESIGN-TOKENS.md compliance
 *
 * Button colors per DESIGN-TOKENS.md:
 * - Primary (Sage Green #4F6E44): "Make it", "Confirm", "Save" actions
 * - Secondary (Gold #E2A93B): "Swap", "Change", "Edit" actions
 * - Danger (Brick Red #B94A34): "Delete", "Remove", destructive actions
 * - Ghost: "Ignore", "Cancel", "Add staples"
 * - Ghost Destructive: "Clear list"
 */

export default function DesignDemoPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      fontFamily: 'var(--font-sans)'
    }}>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '2rem',
        marginBottom: '2rem'
      }}>
        Dinner Bell — Button Design Demo
      </h1>

      <p style={{ marginBottom: '1.5rem', color: 'var(--color-muted)' }}>
        Verifying button colors per DESIGN-TOKENS.md
      </p>

      {/* Button Showcase */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '600px'
      }}>

        {/* Primary Button - Sage Green */}
        <section style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
            Primary Button (Sage Green #4F6E44)
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            For positive &quot;go&quot; actions: Make it, Confirm, Save
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary">Make it</button>
            <button className="btn btn-primary">Confirm</button>
            <button className="btn btn-primary">Save</button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </div>
        </section>

        {/* Secondary Button - Gold */}
        <section style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
            Secondary Button (Gold #E2A93B)
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            For change actions: Swap, Change, Edit
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary">Swap</button>
            <button className="btn btn-secondary">Change</button>
            <button className="btn btn-secondary">Edit</button>
            <button className="btn btn-secondary" disabled>Disabled</button>
          </div>
        </section>

        {/* Danger Button - Brick Red */}
        <section style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
            Danger Button (Brick Red #B94A34)
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            For destructive actions: Delete, Remove, Swap ingredient (in alerts)
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-danger">Delete</button>
            <button className="btn btn-danger">Remove</button>
            <button className="btn btn-danger">Swap ingredient</button>
            <button className="btn btn-danger" disabled>Disabled</button>
          </div>
        </section>

        {/* Ghost Button */}
        <section style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
            Ghost Button
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            For tertiary actions: Ignore, Cancel, Add staples
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost">Ignore</button>
            <button className="btn btn-ghost">Cancel</button>
            <button className="btn btn-ghost">Add staples</button>
            <button className="btn btn-ghost" disabled>Disabled</button>
          </div>
        </section>

        {/* Ghost Destructive Button */}
        <section style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
            Ghost Destructive Button
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            For dangerous tertiary actions: Clear list
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost-destructive">Clear list</button>
            <button className="btn btn-ghost-destructive" disabled>Disabled</button>
          </div>
        </section>

        {/* Color Reference */}
        <section style={{
          padding: '1.5rem',
          backgroundColor: 'var(--color-card)',
          borderRadius: '0.5rem'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
            Color Reference
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#4F6E44',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
              }} />
              <span style={{ fontSize: '0.75rem' }}>Sage Green<br/>#4F6E44</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#E2A93B',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
              }} />
              <span style={{ fontSize: '0.75rem' }}>Gold<br/>#E2A93B</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#B94A34',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
              }} />
              <span style={{ fontSize: '0.75rem' }}>Brick Red<br/>#B94A34</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
