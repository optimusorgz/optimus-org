function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#333',
      color: 'white'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Website</div>
      <div>
        <a href="#" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>Home</a>
        <a href="#about" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>About Us</a>
      </div>
    </nav>
  );
}

export default Navbar;
