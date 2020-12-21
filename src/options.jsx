import "typeface-roboto"
import browser from "webextension-polyfill"
import defaults from "data/defaults"
import theme from "source/theme"
import React from "react"
import ReactDOM from "react-dom"
import Options from "components/Options"
import CssBaseline from "@material-ui/core/CssBaseline"
import { MuiThemeProvider } from "@material-ui/core/styles"
import { StorageProvider, StorageConsumer } from "contexts/StorageContext"

ReactDOM.render (
	<StorageProvider
		defaults={defaults} >
		<StorageConsumer>
		{
			storage => <MuiThemeProvider
				theme={theme ( storage.data.dark )} >
				<CssBaseline/>
				<Options/>
			</MuiThemeProvider>
		}
		</StorageConsumer>
	</StorageProvider>,
	document.getElementById ("main"),
)
