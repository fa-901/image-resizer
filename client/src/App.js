import { useEffect, useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageDownloader from './components/ImageDownloader';

function App() {
	const [urlData, setURLData] = useState([]);
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
				<ImageUploader onUpload={(data) => { setURLData(data) }} />
				{urlData.length > 1 && <ImageDownloader urlData={urlData} onClearData={setURLData} />}
			</main>
		</div>
	);
}

export default App;
