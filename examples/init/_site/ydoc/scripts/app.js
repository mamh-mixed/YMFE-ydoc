var $panel = document.getElementById('js-panel'),
	$header = document.getElementById('js-header'),
	$content = document.getElementById('js-content'),
	$navIcon = document.getElementById('js-nav-btn'),
	$summaryItems = Array.prototype.slice.call(document.querySelectorAll('#js-menu .href')),
	$menu = document.getElementById('js-menu'),
	$menuContent = document.getElementById('js-menu-content'),
	$menuBar = document.getElementById('js-summary-switch'),
	$collapsibleBlocks = Array.prototype.slice.call(document.querySelectorAll('[data-collapsible="true"]')),
	navigation;

var utils = {
	debounce: function(func, wait) {
		var timeout;
		return function () {
			clearTimeout(timeout);
			timeout = setTimeout(func, wait);
		};
	}
};

function getSummaryActiveTarget(item) {
	var current = item;
	while (current && current !== document) {
		if (current.classList && current.classList.contains('m-summary-header')) {
			var headerBlock = current.parentNode;
			if (headerBlock && headerBlock.getAttribute && headerBlock.getAttribute('data-collapsible') === 'true') {
				return headerBlock;
			}
		}
		if (current.classList && current.classList.contains('item')) {
			return current;
		}
		current = current.parentNode;
	}
	current = item;
	while (current && current !== document) {
		if (current.getAttribute && current.getAttribute('data-collapsible') === 'true') {
			return current;
		}
		current = current.parentNode;
	}
	return null;
}

function getCollapsibleHeader(block) {
	var children = block.children || [];
	for (var i = 0; i < children.length; i++) {
		if (children[i].classList && children[i].classList.contains('m-summary-header')) {
			return children[i];
		}
	}
	return null;
}

function getClosestLink(node) {
	var current = node;
	while (current && current !== document) {
		if (current.tagName && current.tagName.toLowerCase() === 'a') {
			return current;
		}
		current = current.parentNode;
	}
	return null;
}

// Add 'active' to summary item
function itemAddActive() {
	var locationHref = window.location.href;
	$summaryItems.map(function (item, index) {
		var activeTarget = getSummaryActiveTarget(item);
		if (!activeTarget) return;
		if (item.href === locationHref) {
			// add 'active' for present summary item.
			activeTarget.classList.add('active');
		} else {
			activeTarget.classList.remove('active');
		}
	});
}

// Initialize collapsible blocks - expand active item's parents
function initCollapsibleBlocks() {
	$collapsibleBlocks.forEach(function(block) {
		var isActiveInside = block.classList.contains('active') || block.querySelector('.active') !== null;
		block.classList.toggle('collapsed', !isActiveInside);
	});
}

// Toggle collapsible block
function toggleCollapsibleBlock(block) {
	block.classList.toggle('collapsed');
}

// Add EventListener
function addEvents() {
	$panel.addEventListener('click', function (e) {
		itemAddActive();
		if (e.target.scrollTop > 0) {
			$header.classList.add('moved');
		} else {
			$header.classList.remove('moved');
		}
	});
	if ($menuContent) {
		$menuContent.addEventListener('click', function (e) {
			$menu.classList.remove('active');
			setTimeout(itemAddActive, 0);
		});
	}
	if ($menuBar) {
		$menuBar.addEventListener('click', function () {
			$menu.classList.toggle('active');
			// 侧栏菜单点击时收起 nav 导航
			if ($navIcon.classList.value.indexOf('active') !== -1) {
				navigation.toggle();
			}
		});
	}

	// Bind collapsible block toggle events
	$collapsibleBlocks.forEach(function(block) {
		var header = getCollapsibleHeader(block);
		if (!header) return;
		header.addEventListener('click', function(e) {
			if (getClosestLink(e.target)) {
				return;
			}
			e.stopPropagation();
			toggleCollapsibleBlock(block);
		});
	});
	if ($menu) {
		$menu.addEventListener('scroll', function(e) {
			sessionStorage.setItem('menuScrollTop', e.target.scrollTop);
		});
	}
	if ($content) {
		$content.addEventListener('scroll', function (e) {
			sessionStorage.setItem('contentScrollTop', e.target.scrollTop);
		});
	}

	// 刚进入页面时重置侧导及主内容区的 scrollTop 值
	if (sessionStorage.prevPrevPathname !== window.location.pathname && sessionStorage.prevPathname !== window.location.pathname) {
		sessionStorage.setItem('contentScrollTop', '0');
	} else if (sessionStorage.prevPrevPathname === window.location.pathname) {
		sessionStorage.setItem('contentScrollTop', sessionStorage.prevPrevContentScrollTop);
	}
}

// initial components
function initComponents() {
	// nav
	navigation = responsiveNav('.js-nav', {
		customToggle: '#js-nav-btn',
		open: function() {
			if ($menu) $menu.classList.remove('active');
			setTimeout(itemAddActive, 0);
		}
	});
}


initComponents();
addEvents();
itemAddActive();
initCollapsibleBlocks();
