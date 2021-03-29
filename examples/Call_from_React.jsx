// This is an example of integrtion in React by scombat : https://github.com/scombat/react-cpu-audio
// React will directly target the native web-component if called in lowercase.
// Don't forget that classes for Web-Component must be inserted via `class` attribute, not `className`
// More about native Web-Components in React : https://fr.reactjs.org/docs/web-components.html
// Note that your linter may not like the  build

import React, { useEffect } from 'react';

export const CpuAudio = () => {
	useEffect(() => import("./cpu-audio.js"), []);

	return (
		<cpu-audio>
			<audio controls src='/blank.mp3'></audio>
		</cpu-audio>
	)
};

const App = () => (
	<CpuAudio></CpuAudio>
)

export default App