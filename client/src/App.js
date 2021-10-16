import { useEffect } from 'react';
import ImageUploader from './components/ImageUploader';

function App() {
	useEffect(() => {
		fetch("/api")
			.then((res) => { return res.json() })
			.then((data) => console.log(data.message));
	}, []);

	return (
		<div className="font-sans container mx-auto h-screen text-center py-10 flex flex-col items-center">
			<header className='text-2xl mb-5'>
				Image Resizer
			</header>
			<main>
				<ImageUploader />
			</main>
		</div>
	);
}

export default App;
