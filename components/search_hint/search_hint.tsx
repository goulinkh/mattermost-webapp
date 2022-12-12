// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';

import {FormattedMessage, MessageDescriptor} from 'react-intl';
import classNames from 'classnames';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isFileAttachmentsEnabled} from 'utils/file_utils';
import {RecentSearchParams} from '@mattermost/types/search';
import {formatRecentSearch} from 'components/search/utils';

interface SearchTerm {
    searchTerm: string;
    message: MessageDescriptor;
    additionalDisplay?: string;
}

type Props = {
    withTitle?: boolean;
    onOptionSelected: (term: string) => void;
    onMouseDown?: () => void | undefined;
    options: SearchTerm[];
    highlightedIndex?: number;
    highlightedIndexChangedViaKeyPress?: boolean;
    onOptionHover?: (index: number) => void;
    onSearchTypeSelected?: (searchType: 'files' | 'messages') => void;
    onElementBlur?: () => void;
    onElementFocus?: () => void;
    searchType?: 'files' | 'messages' | '';
    recentSearches?: RecentSearchParams[];
    onRecentSearchSelected?: (query: string) => void;
}

const SearchHint = (props: Props): JSX.Element => {
    const handleOnOptionHover = (optionIndex: number) => {
        if (props.onOptionHover) {
            props.onOptionHover(optionIndex);
        }
    };

    const buttons = useRef<HTMLDivElement>(null);
    const searchHintList = useRef<HTMLUListElement>(null);
    const recentSearchesList = useRef<HTMLUListElement>(null);

    const config = useSelector(getConfig);
    const isFileAttachmentEnabled = isFileAttachmentsEnabled(config);

    useEffect(() => {
        if (!props.highlightedIndexChangedViaKeyPress) {
            return;
        }
        const selectableItems = [
            ...(buttons.current?.children || []),
            ...(searchHintList.current?.children || []),
            ...(recentSearchesList.current?.children || [])];
        const highlightedIndex = props.highlightedIndex || -1;
        const highlightedItem = selectableItems[highlightedIndex];
        if (highlightedItem) {
            highlightedItem.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }, [props.highlightedIndex, props.highlightedIndexChangedViaKeyPress]);

    if (props.onSearchTypeSelected) {
        if (!props.searchType) {
            return (
                <div
                    className='search-hint__search-type-selector'
                    onMouseDown={props.onMouseDown}
                >
                    <div>
                        <FormattedMessage
                            id='search_bar.usage.search_type_question'
                            defaultMessage='What are you searching for?'
                        />
                    </div>
                    <div
                        ref={buttons}
                        className='button-container'
                    >
                        <button
                            className={classNames({highlighted: props.highlightedIndex === 0})}
                            onClick={() => props.onSearchTypeSelected && props.onSearchTypeSelected('messages')}
                            onBlur={() => props.onElementBlur && props.onElementBlur()}
                            onFocus={() => props.onElementFocus && props.onElementFocus()}
                        >
                            <i className='icon icon-message-text-outline'/>
                            <FormattedMessage
                                id='search_bar.usage.search_type_messages'
                                defaultMessage='Messages'
                            />
                        </button>
                        { isFileAttachmentEnabled &&
                            <button
                                className={classNames({highlighted: props.highlightedIndex === 1})}
                                onClick={() => props.onSearchTypeSelected && props.onSearchTypeSelected('files')}
                                onBlur={() => props.onElementBlur && props.onElementBlur()}
                                onFocus={() => props.onElementFocus && props.onElementFocus()}
                            >
                                <i className='icon icon-file-text-outline'/>
                                <FormattedMessage
                                    id='search_bar.usage.search_type_files'
                                    defaultMessage='Files'
                                />
                            </button>}
                    </div>
                </div>
            );
        }
    }

    return (
        <React.Fragment>
            {props.withTitle && (!props.searchType) &&
                <h4 className='search-hint__title'>
                    <FormattedMessage
                        id='search_bar.usage.title'
                        defaultMessage='Search options'
                    />
                </h4>
            }
            {props.withTitle && props.searchType === 'files' &&
                <h4 className='search-hint__title'>
                    <FormattedMessage
                        id='search_bar.usage.title_files'
                        defaultMessage='File search options'
                    />
                </h4>
            }
            {props.withTitle && props.searchType === 'messages' &&
                <h4 className='search-hint__title'>
                    <FormattedMessage
                        id='search_bar.usage.title_messages'
                        defaultMessage='Message search options'
                    />
                </h4>
            }
            <ul
                ref={searchHintList}
                role='list'
                className='search-hint__suggestions-list'
                onMouseDown={props.onMouseDown}
                onTouchEnd={props.onMouseDown}
            >
                {props.options.map((option, optionIndex) => (
                    <li
                        className={classNames('search-hint__suggestions-list__option', {highlighted: optionIndex === props.highlightedIndex})}
                        key={option.searchTerm}
                        onMouseDown={() => props.onOptionSelected(option.searchTerm)}
                        onTouchEnd={() => props.onOptionSelected(option.searchTerm)}
                        onMouseOver={() => handleOnOptionHover(optionIndex)}
                    >
                        <div className='search-hint__suggestion-list__flex-wrap'>
                            <span className='search-hint__suggestion-list__label'>{option.additionalDisplay ? option.additionalDisplay : option.searchTerm}</span>
                        </div>
                        <div className='search-hint__suggestion-list__value'>
                            <FormattedMessage
                                id={option.message.id}
                                defaultMessage={option.message.defaultMessage}
                            />
                        </div>
                    </li>))}
            </ul>
            {props.recentSearches && props.recentSearches.length ? <>
                <h4 className='recent-searches__title'>
                    <FormattedMessage
                        id='search_bar.usage.recent_searches'
                        defaultMessage='Recent searches'
                    />
                </h4>
                <ul
                    ref={recentSearchesList}
                    role='list'
                    className='recent-searches__suggestions-list'
                >
                    {props.recentSearches.map((searchParams, optionIndex) => {
                        const searchQuery = formatRecentSearch(searchParams);
                        return (
                            <li
                                className={classNames(
                                    'recent-searches__suggestions-list__item',
                                    {
                                        highlighted:
                                            props.highlightedIndex ===
                                            props.options.length + optionIndex,
                                    },
                                )}
                                key={String(optionIndex) + searchQuery}
                                onMouseDown={() =>
                                    props.onRecentSearchSelected?.(searchQuery)
                                }
                                onTouchEnd={() =>
                                    props.onRecentSearchSelected?.(searchQuery)
                                }
                                onMouseOver={() =>
                                    handleOnOptionHover(
                                        props.options.length + optionIndex,
                                    )
                                }
                            >
                                {searchQuery}
                            </li>
                        );
                    })}
                </ul>
            </> : null
            }
        </React.Fragment>
    );
};

export default SearchHint;
