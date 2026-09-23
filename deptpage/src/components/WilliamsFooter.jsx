const WilliamsFooter = () => (
  <div>
    <div style={{ height: '10px', backgroundColor: 'white' }} />
    <div style={{ height: '10px', backgroundColor: '#FFBE0A' }} />
    <div style={{ height: '10px', backgroundColor: '#280050' }} />
    <div className="footer">
      <div className="pagebody" style={{ display: 'flex', flexFlow: 'row nowrap',  }}>
        <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: '80px' }} />
        <div style={{ paddingTop: '20px' }}>
          <a className="williams-link" href="https://williams.edu">Williams College</a>
        </div>
      </div>
    </div>
  </div>
)

export default WilliamsFooter;