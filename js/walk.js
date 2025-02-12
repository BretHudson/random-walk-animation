// NOTE(bret): global variables set in index.html

/// Prototypes
if (typeof Math.clamp === 'undefined') {
	Math.clamp = (val, min, max) => {
		if (val < min) return min;
		if (val > max) return max;
		return val;
	};
}

/// Generate grid
export const startWalker = () => {
	document.documentElement.style.setProperty('--grid-size', gridSize);

	const gridElem = document.getElementById('grid');
	gridElem.replaceChildren(); // empty the grid (web hot reloader)
	for (let y = 0; y < gridSize; ++y) {
		for (let x = 0; x < gridSize; ++x) {
			const cell = document.createElement('div');
			cell.classList.add('cell');
			gridElem.append(cell);
		}
	}

	const _cells = [...gridElem.children];
	const getCell = (x, y) => _cells[y * gridSize + x];

	/// Input
	const isDown = {};
	let step = 0;
	const maxSteps = 3;
	window.addEventListener('keydown', (e) => {
		if (isDown[e.key]) return;

		const prevStep = step;

		switch (e.key) {
			case 'ArrowLeft':
				--step;
				break;
			case 'ArrowRight':
				++step;
				break;
		}

		step = Math.clamp(step, 0, maxSteps);

		if (prevStep !== step) {
			console.log('we updated');
		}

		isDown[e.key] = true;
	});

	window.addEventListener('keyup', (e) => {
		isDown[e.key] = false;
	});
};
