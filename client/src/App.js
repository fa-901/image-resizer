import React from 'react';

function App() {
	React.useEffect(() => {
		fetch("/api")
			.then((res) => { return res.json() })
			.then((data) => console.log(data.message));
	}, []);
	return (
		<div className="App">
			<header>
				Image Resizer
			</header>
			<main>

			</main>
		</div>
	);
}

export default App;
