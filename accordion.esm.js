export class Accordion {
	// ----- Set Defaults
	static defaults() {
		return {
			hideByDefault: true,
			hideExceptFirst: true,
			singularMode: false,
			singularAllowHide: true,
			useSchema: false,
			classGroup: '.accordion__group',
			classItem: '.accordion',
			classPanel: '.accordion__panel',
			classButton: '.accordion__button'
		};
	}

	// ----- Constructor
	constructor(opt = {}) {
		// Bring in default values
		opt = Object.assign(Accordion.defaults(), opt);
		// Apply new object to 'this'
		Object.assign(this, opt);
		this.getInstance();
	}

	// ----- Create a main object encompassing all the component elements.
	set generate(groups) {
		let componentObject = [];
		groups.forEach(el => {
			let group = [];
			let accordions = el.querySelectorAll(this.classItem);
			accordions.forEach(el => {
				// Push our new array to the group.
				group.push({ element: this.getElements(el) });
			});
			// Create temporary object to transmute into original array.
			let transientObject = {
				accordions: { ...group },
				group: el
			};
			// Set group as a new object, and push to the main object.
			group = transientObject;
			componentObject.push(group);
			// Free up memory by deleting transient.
			transientObject = null;
		});
		this.allObjects = componentObject;
	}

	// ----- Return max height in a literal.
	static getMaxHeight(el) {
		return `${el.scrollHeight}px`;
	}

	// ----- Get objects from individual groups.
	getElements(accordion) {
		return {
			accordion: accordion,
			panel: accordion.querySelector(this.classPanel),
			button: accordion.querySelector(this.classButton)
		};
	}

	// ----- Get objects from individual groups.
	setAttributes(el, direction) {
		const { accordion, button, panel } = el;
		if (direction === 'expand')
			accordion.setAttribute('data-active', true),
				panel.setAttribute('aria-expanded', true);
		else {
			accordion.setAttribute('data-active', false),
				panel.setAttribute('aria-expanded', false);
		}
	}

	// ----- If required, set the schema properties.
	setSchema(el) {
		el.accordion.setAttribute('itemprop', 'mainEntity');
		el.button.setAttribute('itemprop', 'name');
		el.panel.setAttribute('itemprop', 'acceptedAnswer');
	}

	animatorCore(el, context) {
		let maxHeight = Accordion.getMaxHeight(el);
		let animatorEase = 'cubic-bezier(.4,0,.2,1)';
		let animatorKeyframes;
		// -----
		let animatorTiming = {
			duration: 300,
			easing: animatorEase
		};
		// -----
		if (context === 'collapse') {
			el.style.maxHeight = maxHeight;
			animatorKeyframes = [
				{ maxHeight: maxHeight },
				{ maxHeight: '0px' }
			];
		}
		if (context === 'expand') {
			el.style.maxHeight = '0px';
			animatorKeyframes = [
				{ maxHeight: '0px' },
				{ maxHeight: maxHeight }
			];
		}
		// -----
		let animatorStage = el.animate(animatorKeyframes, animatorTiming);
		// -----
		animatorStage.onfinish = () => {
			if (context === 'collapse') maxHeight = '0px';
			if (context === 'expand') maxHeight = null;
			el.style.maxHeight = maxHeight;
		};
	}

	// ----- Collapse Function
	collapse(el, maxHeight) {
		const { accordion, panel, toggle } = el;
		this.setAttributes(el);
		this.animatorCore(panel, 'collapse');
	}

	// ----- Expand Function
	expand(el, maxHeight) {
		const { accordion, panel, toggle } = el;
		this.setAttributes(el, 'expand');
		this.animatorCore(panel, 'expand');
	}

	// ----- Click Function
	handleClick(groupObject) {
		groupObject.group.addEventListener('click', evt => {
			// Check to see that the item is being clicked on the button.
			let isButton = evt.target.closest(this.classButton);
			if (!isButton) return;
			evt.preventDefault();

			// Get target element.
			let target = evt.target.closest(this.classItem);
			let accordionList = groupObject.accordions;
			for (let item in accordionList) {
				const { element, maxHeight } = accordionList[item];
				const { accordion, panel, toggle } = element;
				//Handle conditional event delegation.
				if (accordion == target) {
					if (this.singularAllowHide === false) {
						target.dataset.active === 'false' &&
							this.expand(element, maxHeight);
					}
					if (this.singularAllowHide === true) {
						target.dataset.active === 'false'
							? this.expand(element, maxHeight)
							: this.collapse(element, maxHeight);
					}
				} else {
					if (this.singularMode === true) {
						accordion.dataset.active === 'true' &&
							this.collapse(element, maxHeight);
					}
				}
			}
		});
	}

	// ----- Load Function
	handleLoad(groupObject) {
		window.addEventListener('load', evt => {
			let accordionList = groupObject.accordions;
			for (let accordion in accordionList) {
				accordion = accordionList[accordion].element;
				this.useSchema && this.setSchema(accordion);
				this.hideByDefault === true
					? this.collapse(accordion)
					: this.setAttributes(accordion, 'expand');
			}
		});
	}

	// ----- Get individual groups.
	getInstance() {
		let group = document.querySelectorAll(this.classGroup);
		if (group.length === 0) return;
		this.generate = group;
		this.allObjects.forEach(groupObject => {
			this.handleLoad(groupObject);
			this.handleClick(groupObject);
		});
	}
}
