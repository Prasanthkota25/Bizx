import { Link } from 'react-router-dom';

function RightPanel() {
  return (
    <div className='custom-box'>
      <h4>Leave</h4>

      <div className='list-group'>
        <Link className='list-group-item list-group-item-action' to='/leave/applyleave'>
          Apply Leave
        </Link>

        <Link className='list-group-item list-group-item-action' to='/leave/leavebalance'>
          Leave Balance
        </Link>

        <Link className='list-group-item list-group-item-action' to='/leave/myteamleave'>
          My Team Leave
        </Link>
      </div>
    </div>
  );
}

export default RightPanel;
