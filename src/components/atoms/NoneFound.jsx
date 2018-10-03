import React from "react"
import PropTypes from "prop-types"

class NoneFound extends React.Component {

	render () {
		return <div className="none-found" >No Cookies<br/>Found</div>
	}

}

NoneFound.propTypes = {}

NoneFound.defaultProps = {}

export default NoneFound
