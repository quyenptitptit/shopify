import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useState, useContext, useCallback } from 'react';
import { pageContext } from '../context/pageContext';

export function EditorPage(props) {
    // const { setActiveHeader } = useContext(pageContext)
    // const { setContent } = useContext(pageContext)
    // const { content } = useContext(pageContext)

    const handleChange= useCallback((event,editor) =>{
        const data = editor.getData();
        props.setBody(data)
        // console.log(event);
        // setActiveHeader(true)
    },[]) 

    return (
        <CKEditor
            editor={ClassicEditor}
            data={props.body}
            title="Content"
            onReady={editor => {
                editor.editing.view.change((writer) => {
                    writer.setStyle(
                        "height",
                        "150px",
                        editor.editing.view.document.getRoot()
                    );
                })
            }}
            onChange={(event, editor) => handleChange(event,editor)}
        />
    );
}

export default EditorPage;