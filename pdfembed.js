Vue.component('jppdfembed', {
    template:
    `<div  v-bind:id="jp_props.id" :class="jp_props.classes"  :style="jp_props.style"></div>`,
    data: function () {
        return {
            adobeApiReady: false,
            previewFilePromise: null,
            adobeDCView: null
        }
    },
    methods: {
        renderPdf(url, fileName) {
            if (!this.adobeApiReady) {
                console.log('API not ready yet');
                return
            }

            jp_props = this.$props.jp_props;
            this.adobeDCView = new AdobeDC.View({
                clientId: jp_props.client_id,
                divId: jp_props.id.toString()
            });

            // Register component
            comp_dict[jp_props.id] = this;

            const previewConfig = {
                defaultViewMode: jp_props.defaultViewMode,
                showAnnotationTools: jp_props.showAnnotationTools,
                embedMode: jp_props.embedMode,
                focusOnRendering: jp_props.focusOnRendering,
                showDownloadPDF: jp_props.showDownloadPDF,
                showPrintPDF: jp_props.showPrintPDF,
                showPageControls: jp_props.showPageControls,
                dockPageControls: jp_props.dockPageControls,
                showLeftHandPanel: jp_props.showLeftHandPanel,
                showDownloadPDF: jp_props.showDownloadPDF,
                showPrintPDF: jp_props.showDownloadPDF,
            }

            this.previewFilePromise = this.adobeDCView.previewFile({
                content: {
                    location: {url: url}
                },
                metaData: {fileName: fileName, id: fileName},
            }, previewConfig);

            /* Options to control save behavior */
            const saveOptions = {
                autoSaveFrequency: jp_props.autoSaveFrequency,
                enableFocusPolling: jp_props.enableFocusPolling,
                showSaveButton: jp_props.showSaveButton,
            }

            /* from https://www.isummation.com/blog/convert-arraybuffer-to-base64-string-and-vice-versa/ */
            function arrayBufferToBase64( buffer ) {
                var binary = '';
                var bytes = new Uint8Array( buffer );
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode( bytes[ i ] );
                }
                return window.btoa( binary );
}
            /* Register save callback */
            this.adobeDCView.registerCallback(
                AdobeDC.View.Enum.CallbackType.SAVE_API,
                function(metaData, content, options) {
                    const edata = {
                        'event_type': 'file_save',
                        'file_name': fileName,
                        'file_content': arrayBufferToBase64(content),
                        'file_metadata': metaData,
                        'id': jp_props.id,
                        'page_id': page_id,
                        'websocket_id': websocket_id
                    };
                    send_to_server(edata, 'event');
                    /* Save callback success case */
                    return new Promise((resolve, reject) => {
                        resolve({
                            code: AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
                            data: {
                            metaData: Object.assign(metaData, {fileName: fileName})
                            }
                        })
                    })

                    /* Save callback failure case */
                    /* return new Promise((resolve, reject) => {
                        reject({
                            code: this.AdobeDC.View.Enum.ApiResponseCode.FAIL,
                            data: {
                                <Optional>
                            }
                        });
                    }); */

                },
                saveOptions
            );

        },
        nextPage() {
            this.previewFilePromise.then(adobeViewer => {
                adobeViewer.getAPIs().then(apis => {
                    apis.getCurrentPage()
                        .then(currentPage => apis.gotoLocation(currentPage + 1))
                        .catch(error => console.error(error))
                })
            })
        },
        previousPage() {
            this.previewFilePromise.then(adobeViewer => {
                adobeViewer.getAPIs().then(apis => {
                    apis.getCurrentPage()
                        .then(currentPage => {
                            if (currentPage > 1) {
                                return apis.gotoLocation(currentPage - 1)
                            }
                        })
                        .catch(error => console.error(error))
                })
            })
        },
        gotoLocation(page, x, y) {
            this.previewFilePromise.then(adobeViewer => {
                adobeViewer.getAPIs().then(apis => {
                    apis.gotoLocation(page, x, y)
                        .then(() => console.log("Success"))
                        .catch(error => console.log(error));
                })
            })
        },
    },
    mounted() {
        comp_dict[this.$props.jp_props.id] = this;

        if (window.AdobeDC) {
            console.log('AdobeDC ready', this);
            this.adobeApiReady = true;
        } else {
            console.log('AdobeDC not ready', this);
            document.addEventListener('adobe_dc_view_sdk.ready', () => {
                this.adobeApiReady = true;
            })
        };
    },
    updated() {
    },
    props: {
        jp_props: Object
    }
});
