import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { usePage } from '@inertiajs/react';


const RichEditor = React.forwardRef(({ className, name, control, errors, setValue, ...props }, ref) => {
    const page = usePage();
    const tinymceApiKey = page.props.tinymceApiKey;

    return (
        <>
            <input
                id={name}
                name={name}
                className="input"
                style={{ display: "none" }}
                control={control}
                errors={errors}
                {...props}
            />
            <Editor
                ref={ref}
                className={className}
                apiKey={tinymceApiKey}
                init={{
                    height: 450,
                    plugins: [
                        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'code'
                    ],
                    toolbar: 'code | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                    tinycomments_mode: 'embedded',
                }}
                value={props.value}
                onEditorChange={(newValue) => {
                    setValue(name, newValue, { shouldValidate: true })
                }}
            />
            {
                errors && errors[props.name] && (
                    <p className="text-red-500 text-sm font-normal mt-2">
                        {errors[props.name].message || `${props.name.charAt(0).toUpperCase()}${props.name.slice(1)} is required.`}
                    </p>
                )
            }
        </>
    );
});

export default RichEditor;
