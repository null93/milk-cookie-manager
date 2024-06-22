import _ from "lodash"
import enLocale from "data/locales/en"
import ruLocale from "data/locales/ru"
import zhLocale from "data/locales/zh"

module.exports = {
	getTranslator: function ( locale ) {
		switch ( locale ) {
			case "ru": return key => _.get ( ruLocale, key + ".message", key )
			case "zh": return key => _.get ( zhLocale, key + ".message", key )
			default:   return key => _.get ( enLocale, key + ".message", key )
		}
	}
}
