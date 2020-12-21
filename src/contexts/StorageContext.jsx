import _ from "lodash"
import browser from "webextension-polyfill"
import React from "react"
import PropTypes from "prop-types"

const { Provider, Consumer } = React.createContext ()

class StorageProvider extends React.Component {

	constructor ( props ) {
		super ( props )
		const defaults = props.defaults
		const cached = this.loadCache ()
		const combined = _.defaults ( cached, defaults )
		this.state = {
			cached: combined,
			data: combined,
			initialized: false,
		}
	}

	componentDidMount () {
		browser.storage.onChanged.addListener ( this.load.bind ( this ) )
		this.load ()
	}

	componentWillUnmount () {
		browser.storage.onChanged.removeListener ( this.load.bind ( this ) )
	}

	loadCache ( data ) {
		const { defaults } = this.props
		try {
			const cached = window.localStorage.getItem ("data")
			if ( !cached ) {
				this.saveCache ( defaults )
				return defaults
			}
			else {
				return JSON.parse ( cached )
			}
		}
		catch ( error ) {
			return defaults
		}
	}

	saveCache ( data ) {
		if ( !data ) data = this.state.data
		window.localStorage.setItem ( "data", JSON.stringify ( data ) )
	}

	load () {
		const { cached, data } = this.state
		return browser.storage.local
			.get ( _.keys ( data ) )
			.then ( result => {
				const normalized = _.defaults ( result, cached )
				this.saveCache ( normalized )
				this.setState ({
					initialized: true,
					data: normalized,
				})
			})
			.catch ( error => {
				console.error ( "Failed to load from storage:", error )
				this.setState ({
					initialized: true,
					data: cached,
				})
			})
	}

	save () {
		const { data } = this.state
		return browser.storage.local
			.set ( data )
			.then ( () => this.saveCache () )
	}

	set ( key, value ) {
		const { data } = this.state
		const altered = _.defaults ( { [key]: value }, data )
		return browser.storage.local
			.set ( altered )
			.then ( () => this.saveCache ( altered ) )
	}

	add ( name, key, value ) {
		const list = this.state.data [ name ]
		const keys = Array.isArray ( key ) ? key : [ key ]
		const values = Array.isArray ( key ) ? value : [ value ]
		for ( let i in keys ) {
			list [ keys [ i ] ] = values [ i ]
		}
		return this.set ( name, list )
	}

	remove ( name, key ) {
		const list = this.state.data [ name ]
		delete list [ key ]
		return this.set ( key, list )
	}

	render () {
		const value = {
			initialized: this.state.initialized,
			data: this.state.data,
			set: this.set.bind ( this ),
			add: this.add.bind ( this ),
			remove: this.remove.bind ( this ),
		}
		if ( process.env.NODE_ENV !== "production" ) {
			console.log ( "Storage Provider:", value )
		}
		return <Provider value={value} >
			{this.props.children}
		</Provider>
	}

}

StorageProvider.propTypes = {
	defaults: PropTypes.object.isRequired,
}

StorageProvider.defaultProps = {
	defaults: {},
}

function withStorage ( Component ) {
	const name = `withStorage(${Component.displayName || Component.name})`
	const NewComponent = props => {
		const { wrappedComponentRef, ...remainingProps } = props
		return <Consumer>
		{
			value => <Component
				{...remainingProps}
				storage={value}
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
	withStorage,
	StorageProvider: StorageProvider,
	StorageConsumer: Consumer
}
