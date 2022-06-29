// see https://www.raymondcamden.com/2021/02/17/using-the-pdf-embed-api-with-vuejs
// https://gist.github.com/AlexandruMiricioiu/0ac17faf92e5dd72eabdae21bdbbe4a2

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
        // registerView() {
        //     this.adobeDCView = new AdobeDC.View({
        //         clientId: "31f06deb7bdf42ddb058dfc36613230b",
        //         divId: this.$props.jp_props.id.toString()
        //     });
        // },
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
                autoSaveFrequency: 0,      // <Number, default=0>,
                enableFocusPolling: false, // <Boolean, default=false>,
                showSaveButton: true,      // <Boolean, default=true>
            }

            /* Register save callback */
            this.adobeDCView.registerCallback(
                AdobeDC.View.Enum.CallbackType.SAVE_API,
                function(metaData, content, options) {
                    const edata = {
                        'event_type': 'file_save',
                        'file_name': fileName,
                        'file_content': btoa(String.fromCharCode.apply(null, new Uint8Array(content))),
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
            // this.registerView();
        } else {
            console.log('AdobeDC not ready', this);
            document.addEventListener('adobe_dc_view_sdk.ready', () => {
                this.adobeApiReady = true;
                // this.registerView();
            })
        };
    },
    updated() {
    },
    props: {
        jp_props: Object
    }
});
