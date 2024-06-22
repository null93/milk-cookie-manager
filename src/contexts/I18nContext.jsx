import _ from "lodash"
import React from "react"
import PropTypes from "prop-types"
import i18n from "utils/i18n"

const { Provider, Consumer } = React.createContext ()

class I18nProvider extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = { locale: props.locale }
	}

	static getDerivedStateFromProps ( nextProps, prevState ) {
		if ( nextProps.locale !== prevState.locale ) {
			return { locale: nextProps.locale }
		}
		return null
	}

	render () {
		const value = {
			locale: this.state.locale,
			translate: i18n.getTranslator ( this.state.locale ),
		}
		if ( process.env.NODE_ENV !== "production" ) {
			console.log ( "I18n Provider:", value )
		}
		return <Provider value={{ translate: e => e, ...value }} >
			{this.props.children}
		</Provider>
	}

}

I18nProvider.propTypes = {
	locale: PropTypes.string.isRequired,
}

I18nProvider.defaultProps = {
	locale: "en",
}

function withI18n ( Component ) {
	const name = `withI18n(${Component.displayName || Component.name})`
	const NewComponent = props => {
		const { wrappedComponentRef, ...remainingProps } = props
		return <Consumer>
		{
			value => <Component
				{...remainingProps}
				i18n={ value }
				ref={wrappedComponentRef}
			/>
		}
		</Consumer>
	}
	NewComponent.displayName = name;
	NewComponent.WrappedComponent = Component
	return NewComponent
}

module.exports = {
	withI18n,
	I18nProvider: I18nProvider,
	I18nConsumer: Consumer
}
