import "typeface-roboto"
import Options from "components/Options"
import CssBaseline from "@material-ui/core/CssBaseline"
import React from "react"
import ReactDOM from "react-dom"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { ChromeProvider, ChromeConsumer } from "contexts/ChromeContext"
import theme from "./theme"

const NODE_ENV = process.env.NODE_ENV

ReactDOM.render (
	<ChromeProvider>
		<ChromeConsumer>
		{
			data => {
				if ( NODE_ENV !== "production" ) {
					console.log ( "MuiTheme:", theme ( data.options.dark ) )
				}
				return <MuiThemeProvider theme={theme ( data.options.dark )} >
					<CssBaseline/>
					<Options/>
				</MuiThemeProvider>
			}
		}
		</ChromeConsumer>
	</ChromeProvider>,
	document.getElementById ("main")
)
