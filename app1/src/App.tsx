import './App.css';
import { Route, Routes, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import Page1 from './Page1';
import Page2 from './Page2';

function Nav() {
	return (
		<nav style={{ display: 'flex', gap: '1rem', padding: '1rem 2rem', borderBottom: '1px solid #ccc' }}>
			<Link to="/">Dashboard</Link>
			<Link to="/page1">Page 1</Link>
			<Link to="/page2">Page 2</Link>
		</nav>
	);
}

export default function App() {
	return (
		<>
			<Nav />
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/page1" element={<Page1 />} />
				<Route path="/page2" element={<Page2 />} />
			</Routes>
		</>
	);
}