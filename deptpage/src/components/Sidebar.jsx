import NewsTile from "./NewsTile";

const Sidebar = ({ title, onClick, className }) => (
  <div style={{
    width: '30%',
    flexGrow: 0,
    flexShrink: 0
  }}>
    <div className={`${className} tile`} style={{
      margin: '40px 40px 20px 40px',
      padding: '15px'
    }}>
      {title}
    </div>

    <NewsTile
      onClick={onClick}
      style={{
        margin: '0px 40px 0px 40px',
        height: '250px'
      }}
    />
  </div>
)

export default Sidebar;
