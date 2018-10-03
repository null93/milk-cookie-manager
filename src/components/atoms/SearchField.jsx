import React from "react"
import PropTypes from "prop-types"

class SearchField extends React.Component {

	constructor ( props ) {
		super ( props )
		this.state = {
			value: this.props.value
		}
	}

	onChange ( event ) {
		this.setState ({ value: event.target.value })
	}

	onKeyUp ( event ) {
		this.props.onKeyUp ( this.state.value )
	}

	render () {
		return <div id="search" className="search-field" >
			<i className="material-icons search-icon" >search</i>
			<input
				type="text"
				placeholder="search"
				value={this.state.value}
				onChange={this.onChange.bind (this)}
				onKeyUp={this.onKeyUp.bind (this)}
				autoFocus="autofocus"
			/>
			<div className="highlight" ></div>
		</div>
	}

}

SearchField.propTypes = {
	value: PropTypes.string,
	onKeyUp: PropTypes.func
}

SearchField.defaultProps = {
	value: "",
	onKeyUp: null
}

export default SearchField
