const WilliamsHeader = () => (
  <div className="header">
    <div
      className="pagebody"
      style={{
        display: "flex",
        flexFlow: "row nowrap",
        
      }}
    >
      <div className="left-spacer" style={{ flexGrow: 0, flexShrink: 0, width: "80px" }} />
      <div style={{ width: "100%" }}>
        <div className="williams-title">
          <a className="williams-link-header" href="https://williams.edu">
            Williams
          </a>
        </div>
        <div className="williams-subtitle">Mathematics</div>
      </div>
    </div>
  </div>
);

export default WilliamsHeader;
