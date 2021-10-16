import React from 'react';

function App() {
	React.useEffect(() => {
		fetch("/api")
			.then((res) => { return res.json() })
			.then((data) => console.log(data.message));
	}, []);

	return (
		<div className="font-mono container mx-auto h-screen text-center py-10 flex flex-col items-center">
			<header className='text-2xl mb-5'>
				Image Resizer
			</header>
			<main>

			</main>
		</div>
	);
}

export default App;
