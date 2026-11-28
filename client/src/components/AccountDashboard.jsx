import CustomerPortal from './customer/CustomerPortal.jsx';
import OwnerPortal from './OwnerPortal.jsx';
import AdminPortal from './AdminPortal.jsx';

const roles=[
  {id:'customer',number:'01',title:'Customer',description:'Book rides and follow every trip',icon:'↗'},
  {id:'owner',number:'02',title:'Vehicle Owner',description:'Register cars and manage your fleet',icon:'⌁'},
  {id:'admin',number:'03',title:'Admin',description:'Manage bookings and operations',icon:'⌘'},
];

export default function AccountDashboard(props){
  const {workspace,setWorkspace,setAuthStep,setError,setNotice,customerToken,session,ownerData,adminData}=props;
  const active=roles.find(role=>role.id===workspace)||roles[0];
  const changeRole=(role)=>{
    setWorkspace(role);
    setAuthStep('email');
    setError('');
    setNotice('');
  };
  const descriptions={
    customer:'Create your customer account before booking, then keep every journey in one place.',
    owner:'Verify your mobile number, register your owner profile and submit four-wheelers for approval.',
    admin:'Restricted operations access for provisioned RideYou administrators only.',
  };
  return <section className="account-section" id="workspace">
    <div className="section-wrap account-dashboard">
      <header className="account-intro">
        <div>
          <span className="eyebrow">RIDEYOU ACCOUNT CENTRE</span>
          <h2>One place.<br/><em>Every journey.</em></h2>
        </div>
        <p>Register once, sign in securely and use the workspace built for your role. Customer and vehicle-owner accounts can be created here.</p>
      </header>
      <div className="account-hub">
        <aside className="account-role-rail">
          <div className="account-brand-lockup"><span className="account-brand-mark">R</span><div><b>RideYou</b><small>ACCOUNT HUB</small></div></div>
          <div className="account-rail-label">CHOOSE YOUR SPACE</div>
          <nav className="account-role-list" aria-label="Account type">
            {roles.map(role=><button type="button" key={role.id} className={workspace===role.id?'selected':''} onClick={()=>changeRole(role.id)} aria-pressed={workspace===role.id}>
              <span className="account-role-number">{role.number}</span>
              <span className="account-role-copy"><b>{role.title}</b><small>{role.description}</small></span>
              <span className="account-role-icon">{role.icon}</span>
            </button>)}
          </nav>
          <div className="account-rail-note"><span>●</span><div><b>Private by design</b><small>Your account data stays in its own secure workspace.</small></div></div>
        </aside>
        <main className="account-workspace">
          <div className="account-workspace-head">
            <div><span className="account-kicker">ACCOUNT WORKSPACE / {active.number}</span><h3>{active.title}</h3><p>{descriptions[workspace]||descriptions.customer}</p></div>
            <span className="account-security-badge"><i/> SECURE ACCESS</span>
          </div>
          <div className="account-workspace-content">
            {workspace==='customer'&&<CustomerPortal {...props}/>}
            {workspace==='owner'&&<OwnerPortal {...props}/>}
            {workspace==='admin'&&<AdminPortal {...props}/>}
          </div>
          <footer className="account-workspace-foot"><span>RIDEYOU · BIHAR, INDIA</span><span>Use only your own registered mobile number</span></footer>
        </main>
      </div>
      <div className="account-bottom-note"><span>Need help?</span> Contact the RideYou Booking Manager for account assistance.</div>
    </div>
  </section>;
}
