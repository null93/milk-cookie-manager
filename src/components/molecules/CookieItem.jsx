import React from "react"
import PropTypes from "prop-types"
import Expires from "atom/Expires"
import SecureIcon from "asset/images/secure.svg"
import InsecureIcon from "asset/images/insecure.svg"
import VisibleIcon from "asset/images/visible.svg"
import InvisibleIcon from "asset/images/invisible.svg"
import NoneIcon from "asset/images/none.svg"
import LaxIcon from "asset/images/lax.svg"
import UnspecifiedIcon from "asset/images/unspecified.svg"
import StrictIcon from "asset/images/strict.svg"

class CookieItem extends React.Component {

	highlight ( value ) {
		if ( this.props.term == "" ) return value
		let term = this.props.term.toLowerCase ()
		let lowercase = value.toLowerCase ()
		let original = value
		let results = []
		while ( lowercase.indexOf ( term ) > -1 ) {
			let start = lowercase.indexOf ( term )
			let end = start + term.length
			results.push ( original.substring ( 0, start ) )
			results.push ( <span>{original.substring ( start, end )}</span> )
			original = original.substring ( end )
			lowercase = lowercase.substring ( end )
		}
		results.push ( original )
		return results
	}

	render () {
		return <div className="cookie-item" onClick={this.props.onClick} >
			<div className="properties" >
				<img src={this.props.data.secure ? SecureIcon : InsecureIcon} />
				<img src={this.props.data.httpOnly ? InvisibleIcon : VisibleIcon} />
				<img
					src={{
						"no_restriction": NoneIcon,
						"lax": LaxIcon,
						"strict": StrictIcon,
						"unspecified": UnspecifiedIcon
					} [this.props.data.sameSite]}
				/>
			</div>
			<div className="values" >
				<h1>{this.highlight ( this.props.data.name )}</h1>
				<h2>{this.props.data.hostOnly ? <span className="tag" >host-only</span> : this.highlight ( this.props.data.domain )}</h2>
				<h2>{this.highlight ( this.props.data.path )}</h2>
				<h2>{this.highlight ( this.props.data.value )}</h2>
			</div>
			<div className="expires-container" >
				{this.props.data.session ? <span className="tag" >session</span> : <Expires timestamp={this.props.data.expirationDate} />}
			</div>
		</div>
	}

}

CookieItem.propTypes = {
	term: PropTypes.string,
	onClick: PropTypes.func
}

CookieItem.defaultProps = {
	term: "",
	onClick: null
}

export default CookieItem
