module.exports = {
	// Options
	regexp: false,
	sensitive: false,
	dark: Boolean ( window.matchMedia ("(prefers-color-scheme: dark)").matches ),
	tooltips: true,
	showWarnings: true,
	contextMenu: true,
	expirationFormat: "humanized",
	sortType: "expirationDate",
	sortDirection: "ascending",
	// Lists
	protect: {},
	block: {},
}
