import React from "react"
import PropTypes from "prop-types"

const { Provider, Consumer } = React.createContext ()

class SearchProvider extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			term: "",
			pattern: null,
			filtered: Boolean ( focus.domain ),
		}
	}

	componentDidUpdate ( prev ) {
		const sensitiveChanged = prev.storage.data.sensitive !== this.props.storage.data.sensitive
		const focusInitialized = prev.focus.last === null && this.props.focus.last
		if ( sensitiveChanged ) {
			this.setState ({
				pattern: this.compile (
					this.state.term,
					this.props.storage.data.sensitive,
				)
			})
		}
		if ( focusInitialized ) {
			this.setState ({
				filtered: true,
			})
		}
	}

	compile ( pattern, sensitive ) {
		try {
			const flags = sensitive ? "g" : "ig"
			return new RegExp ( pattern.replace ( /\\/g, "\\" ), flags )
		}
		catch ( error ) {
			return null
		}
	}

	set ( key, value ) {
		const newState = { [key]: value }
		if ( key === "term" ) {
			const { storage: { data: { sensitive } } } = this.props
			newState.pattern = this.compile ( value, sensitive )
		}
		this.setState ( newState )
	}

	filter ( cookies ) {
		const { term } = this.state
		const { sensitive, filtered, regexp } = this.props.storage.data
		const re = this.compile ( term, sensitive )
		if ( term === "" ) return cookies
		if ( regexp && !re ) return []
		if ( regexp && re && new RegExp ( re ).test ("") ) return cookies
		if ( regexp && re ) {
			return cookies.filter ( cookie => {
				return new RegExp ( re ).test (`${cookie.name}`) ||
				new RegExp ( re ).test (`${cookie.domain}${cookie.path}`) ||
				new RegExp ( re ).test (`${cookie.value}`)
			})
		}
		return cookies.filter ( cookie => {
			const nameTarget = sensitive ? cookie.name : cookie.name.toLowerCase ()
			const pathTarget = sensitive ? `${cookie.domain}${cookie.path}` : `${cookie.domain}${cookie.path}`.toLowerCase ()
			const valueTarget = sensitive ? cookie.value : cookie.value.toLowerCase ()
			const search = sensitive ? term : term.toLowerCase ()
			return false ||
				nameTarget.indexOf ( search ) > -1 ||
				pathTarget.indexOf ( search ) > -1 ||
				valueTarget.indexOf ( search ) > -1
		})
	}

	render () {
		const value = {
			term: this.state.term,
			pattern: this.state.pattern,
			filtered: this.state.filtered,
			set: this.set.bind ( this ),
			compile: this.compile.bind ( this ),
			filter: this.filter.bind ( this ),
		}
		if ( process.env.NODE_ENV !== "production" ) {
			console.log ( "Search Provider:", value )
		}
		return <Provider value={value} >
			{this.props.children}
		</Provider>
	}

}

SearchProvider.propTypes = {
	storage: PropTypes.object.isRequired,
	focus: PropTypes.object.isRequired,
}

function withSearch ( Component ) {
	const name = `withSearch(${Component.displayName || Component.name})`
	const NewComponent = props => {
		const { wrappedComponentRef, ...remainingProps } = props
		return <Consumer>
		{
			value => <Component
				{...remainingProps}
				search={value}
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
	withSearch,
	SearchProvider: SearchProvider,
	SearchConsumer: Consumer
}
