import { cubicOut } from 'svelte/easing';

/**
 * @param {Element} node
 * @param {{ delay?: number | undefined; duration?: 400 | undefined; easing?: ((t: number) => number) | undefined; }} params
 */
export function expand(node, params) {
	const {
		delay = 0,
		duration = 400,
		easing = cubicOut
	} = params;

	const w = parseFloat(getComputedStyle(node).strokeWidth);

	return {
		delay,
		duration,
		easing,
		css: (/** @type {number} */ t) => `opacity: ${t}; stroke-width: ${t * w}`
	};
}