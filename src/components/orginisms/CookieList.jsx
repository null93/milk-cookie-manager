import React from "react"
import PropTypes from "prop-types"

class CookieList extends React.Component {

	render () {
		return <div className="cookie-list" >
			{this.props.children}
		</div>
	}

}

CookieList.propTypes = {
}

CookieList.defaultProps = {
}

export default CookieList
