module.exports = {
	// Options
	locale: "en",
	regexp: false,
	sensitive: false,
	dark: Boolean ( window.matchMedia ("(prefers-color-scheme: dark)").matches ),
	tooltips: true,
	showWarnings: true,
	contextMenu: true,
	updateProtectedValue: false,
	expirationFormat: "humanized",
	sortType: "expirationDate",
	sortDirection: "ascending",
	ignoreStoreId: false,
	lastSearch: "",
	displayLastSearch: false,
	// Lists
	protect: {},
	block: {},
}
