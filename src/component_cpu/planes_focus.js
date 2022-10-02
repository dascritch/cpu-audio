import relative_focus from '../component/relative_focus.js';

export const planes_focus = {
	/**
	 * @summary Give focus on an annotation point
	 * @public
	 *
	 * @param      {string}   planeName      The existing plane name
	 * @param      {string}   pointName      The existing point name
	 * @return      boolean    has focus
	 */
	focusPoint: function(planeName, pointName) {
		// get element, first on the plane, and else on the plane
		const element = this.pointPanel(planeName, pointName)?.querySelector('a') ?? this.pointTrack(planeName, pointName);
		if (!element) {
			return false;
		}
		element.focus();
		return true;
	},

	/**
	 * @summary Get focused element in shadow
	 * @public
	 *
	 * @return      {Element|null}   		Focused element, or null
	 */
	focused: function() {
		return this.shadow.querySelector(':focus');
	},

	/**
	 * @summary Get ID of focused element in shadow
	 * @public
	 *
	 * @return      {string|null|undefined}   		Focused ID, or null or undefined
	 */
	focusedId: function() {
		const target = this.focused();
		if (!target) {
			return;
		}
		const out = target.id  != '' ? target.id : target.closest('[id]').id;
		return out == '' ? null : out;
	},

	/**
	 * @summary browse yo with focus in panels using ↑ key
	 * @private
	 */
	prevFocus: function() {
		relative_focus(this, false);
	},

	/**
	 * @summary browse down with focus in panels using ↓ key
	 * @private
	 */
	nextFocus: function() {
		relative_focus(this, true);
	},

};

export default planes_focus;