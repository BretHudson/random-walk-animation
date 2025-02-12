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
	const allPositions = [];
	for (let y = 0; y < gridSize; ++y) {
		for (let x = 0; x < gridSize; ++x) {
			allPositions.push([x, y]);
		}
	}

	allPositions.forEach(([x, y]) => {
		const cell = document.createElement('div');
		cell.classList.add('cell');
		cell.setAttribute('data-x', x);
		cell.setAttribute('data-y', y);
		gridElem.append(cell);
	});

	const _cells = [...gridElem.children];
	const _values = Array.from(_cells, () => 0);
	const getXY = (arr, x, y) => arr[y * gridSize + x];
	const setXY = (arr, x, y, v) => (arr[y * gridSize + x] = v);
	const getCell = (x, y) => getXY(_cells, x, y);
	const setCellValue = (x, y, val) => {
		_values[y * gridSize + x] = val;
		const cell = getCell(x, y);
		let dValue = val.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
		if (+dValue - val > Number.EPSILON) {
			dValue = `~` + dValue;
		}
		cell.setAttribute('data-value', dValue);
		cell.style.setProperty('--opacity', val);
	};

	allPositions.forEach(([x, y]) => {
		setCellValue(x, y, 0);
	});
	setCellValue(...startCell, 1);

	const neighborOffsets = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1],
	];

	const getNeighbors = (cellX, cellY) => {
		return neighborOffsets
			.map(([x, y]) => [cellX + x, cellY + y])
			.filter(([x, y]) => {
				return x >= 0 && y >= 0 && x < gridSize && y < gridSize;
			});
	};

	const cache = [];
	cache.push([..._values]);
	console.log(cache);

	const updateCells = (state) => {
		allPositions.forEach(([x, y]) => {
			setCellValue(x, y, getXY(state, x, y));
		});
	};

	const prevStep = () => {
		updateCells(cache[step]);
	};

	const nextStep = () => {
		if (!cache[step]) {
			const filledCells = allPositions.filter(
				([x, y]) => getXY(_values, x, y) > 0,
			);
			const nextState = Array.from(_values, () => 0);
			filledCells.forEach(([x, y]) => {
				const neighborPos = getNeighbors(x, y);
				const p = getXY(_values, x, y);
				const k = neighborPos.length;
				const remainder = (p * (5 - k)) / 5;
				const fifth = p / 5;

				neighborPos.forEach(([nX, nY]) => {
					setXY(nextState, nX, nY, getXY(nextState, nX, nY) + fifth);
				});
				setXY(nextState, x, y, getXY(nextState, x, y) + remainder);
				// setXY(nextState, x, y, remainder);
			});

			cache[step] = nextState;
		}

		updateCells(cache[step]);
	};

	/// Input
	let step = 0;
	window.addEventListener('keydown', (e) => {
		const lastStep = step;

		switch (e.key) {
			case 'ArrowLeft':
				--step;
				break;
			case 'ArrowRight':
				++step;
				break;
		}

		step = Math.max(0, step);

		if (step > lastStep) nextStep();
		else if (step < lastStep) prevStep();

		document.getElementById('step').textContent = step;
	});
};
